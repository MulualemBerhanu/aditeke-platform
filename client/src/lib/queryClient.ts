import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { refreshTokens, isTokenExpiredError } from './tokenRefresh';
import { addCSRFTokenToHeaders } from './csrfToken';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add retry functionality and better error handling
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add a small delay for retries
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`Retry attempt ${attempt} for ${method} ${url}`);
      }
      
      // Build headers with authentication token if available
      const headers: Record<string, string> = {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Add cache control headers to prevent caching of API requests
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      };
      
      // Add CSRF token for protection against CSRF attacks using our utility
      const csrfHeaders = addCSRFTokenToHeaders(headers);
      Object.entries(csrfHeaders).forEach(([key, value]) => {
        headers[key] = value;
      });
      
      // Import the secure token utility
      const { getAccessToken } = await import('./secureTokenStorage');
      
      // Add JWT token for authentication if available
      const accessToken = getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      // Detect if we're on a different domain in production
      const isCrossDomain = 
        window.location.origin !== new URL(url, window.location.origin).origin;
        
      // In production, use our cross-domain token auth approach
      const isDeployedEnv = isCrossDomain || 
                          window.location.host.includes('.replit.app') || 
                          window.location.host.includes('.replit.dev');
      
      // Log the environment for debugging
      if (attempt === 0) {
        console.log(`🌐 API request to ${url} (${isDeployedEnv ? 'deployed' : 'local'} environment)`);
      }
      
      const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        // Always include credentials, which sends cookies
        credentials: "include",
        // Add these options to help with cross-origin requests
        mode: "cors",
        redirect: "follow"
      });
      
      if (res.ok) {
        return res;
      }

      // If the response is not OK, extract the error message for better debugging
      const errorText = await res.text();
      lastError = new Error(`HTTP error ${res.status}: ${errorText || res.statusText}`);
      
      // Check for auth errors and attempt token refresh if needed
      if (res.status === 401) {
        // Try to refresh the token if we have a refresh token
        if (localStorage.getItem('refreshToken')) {
          try {
            console.warn('Access token expired, attempting refresh...');
            
            // Only attempt refresh once per request attempt
            if (attempt === 0) {
              // Refresh the token and get new tokens
              await refreshTokens();
              
              // Continue to retry with the new token
              throw new Error('Token refreshed, retrying request');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // If token refresh fails, continue to the normal error path
          }
        }
        
        // If in deployed environment, try localStorage fallback
        if (isDeployedEnv && localStorage.getItem('currentUser')) {
          console.warn('Authentication error - using localStorage fallback');
        }
        
        // Otherwise it's a real auth error
        throw lastError;
      }
      
      // For non-auth errors like 403 (forbidden), just throw
      if (res.status === 403) {
        throw lastError;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`API request error (attempt ${attempt}):`, lastError);
      
      // If this is an error we shouldn't retry (like network errors), break the loop
      if (lastError.message.includes('Failed to fetch') && attempt === maxRetries) {
        throw lastError;
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add a small delay for retries
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          console.log(`Retry attempt ${attempt} for GET ${queryKey[0]}`);
        }
        
        // Build headers with authentication token if available
        const headers: Record<string, string> = {
          // Add cache control headers to prevent caching of API requests
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        };
        
        // Add CSRF token for protection against CSRF attacks
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        
        // Import the secure token utility
        const { getAccessToken } = await import('./secureTokenStorage');
        
        // Add JWT token for authentication if available
        const accessToken = getAccessToken();
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Detect if we're on a different domain in production
        const url = queryKey[0] as string;
        const isCrossDomain = 
          window.location.origin !== new URL(url, window.location.origin).origin;
          
        // In production, use our cross-domain token auth approach
        const isDeployedEnv = isCrossDomain || 
                            window.location.host.includes('.replit.app') || 
                            window.location.host.includes('.replit.dev');
        
        // Log the environment for debugging
        if (attempt === 0) {
          console.log(`🔍 API query to ${url} (${isDeployedEnv ? 'deployed' : 'local'} environment)`);
        }
        
        const res = await fetch(url, {
          credentials: "include", // Always include credentials, which sends cookies
          headers,
          // Add these options to help with cross-origin requests
          mode: "cors",
          redirect: "follow"
        });
        
        // Special handling for 401 based on config
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          // In deployed environments with auth errors, try to use fallback auth from localStorage
          if (isDeployedEnv) {
            console.log('Using localStorage fallback for authentication');
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              return JSON.parse(storedUser);
            }
          }
          return null;
        }
        
        if (res.ok) {
          return await res.json();
        }
        
        // If the response is not OK, extract the error message for better debugging
        const errorText = await res.text();
        lastError = new Error(`HTTP error ${res.status}: ${errorText || res.statusText}`);
        
        // Check for auth errors and attempt token refresh if needed
        if (res.status === 401) {
          // Try to refresh the token if we have a refresh token (and we're not already falling back)
          if (localStorage.getItem('refreshToken') && unauthorizedBehavior !== "returnNull") {
            try {
              console.warn('Access token expired in query, attempting refresh...');
              
              // Only attempt refresh once per query attempt
              if (attempt === 0) {
                // Refresh the token and get new tokens
                await refreshTokens();
                
                // Continue to retry with the new token
                throw new Error('Token refreshed, retrying query');
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // If token refresh fails, continue to the normal error path
            }
          }
          
          // If in deployed environment and we're configured to return null, fall back to localStorage
          if (isDeployedEnv && unauthorizedBehavior === "returnNull") {
            console.warn('Authentication error - trying to recover with localStorage');
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              return JSON.parse(storedUser);
            }
          }
          
          // If fallback doesn't apply or failed, throw
          throw lastError;
        }
        
        // For non-auth errors like 403 (forbidden), just throw
        if (res.status === 403) {
          throw lastError;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`API query error (attempt ${attempt}):`, lastError);
        
        // If this is an error we shouldn't retry (like network errors), break the loop
        if (lastError.message.includes('Failed to fetch') && attempt === maxRetries) {
          // In deployed environments with network errors, try to use fallback from localStorage
          if (unauthorizedBehavior === "returnNull") {
            console.warn('Network error - trying to recover with localStorage');
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              return JSON.parse(storedUser);
            }
          }
          throw lastError;
        }
      }
    }
    
    // If we've exhausted all retries, try localStorage fallback for user queries before failing
    if (queryKey[0] === '/api/user' && unauthorizedBehavior === "returnNull") {
      console.warn('All retries failed - trying to recover with localStorage');
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    }
    
    // If we've exhausted all retries and fallbacks, throw the last error
    throw lastError || new Error(`Failed after ${maxRetries} retries`);
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
