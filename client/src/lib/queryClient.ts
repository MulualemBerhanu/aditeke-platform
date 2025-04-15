import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
      
      const res = await fetch(url, {
        method,
        headers: {
          ...(data ? { "Content-Type": "application/json" } : {}),
          // Add cache control headers to prevent caching of API requests
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: data ? JSON.stringify(data) : undefined,
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
      
      // Don't retry on certain status codes
      if (res.status === 401 || res.status === 403) {
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
        
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
          headers: {
            // Add cache control headers to prevent caching of API requests
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
          // Add these options to help with cross-origin requests
          mode: "cors",
          redirect: "follow"
        });
        
        // Special handling for 401 based on config
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }
        
        if (res.ok) {
          return await res.json();
        }
        
        // If the response is not OK, extract the error message for better debugging
        const errorText = await res.text();
        lastError = new Error(`HTTP error ${res.status}: ${errorText || res.statusText}`);
        
        // Don't retry on certain status codes
        if (res.status === 401 || res.status === 403) {
          throw lastError;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`API query error (attempt ${attempt}):`, lastError);
        
        // If this is an error we shouldn't retry (like network errors), break the loop
        if (lastError.message.includes('Failed to fetch') && attempt === maxRetries) {
          throw lastError;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
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
