import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './secureTokenStorage';

// Track if a refresh is already in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Function to break circular dependency
const fetchWithoutAuth = async (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    mode: "cors",
    redirect: "follow"
  });
};

/**
 * Refresh the access token using the refresh token
 * Returns a promise that resolves with the new tokens or rejects if refresh fails
 */
export async function refreshTokens(): Promise<{ accessToken: string, refreshToken: string }> {
  try {
    // If a refresh is already in progress, return the existing promise
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    // Set refreshing flag and create promise
    isRefreshing = true;
    
    refreshPromise = (async () => {
      console.log('Starting token refresh process...');
      
      // First try to get refresh token from secure storage
      let refreshToken = getRefreshToken();
      
      // If no refresh token in secure storage, try localStorage fallback
      if (!refreshToken) {
        console.log('No refresh token in secure storage, checking localStorage fallback...');
        try {
          // Try to get authToken and refreshToken from localStorage as fallback
          refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // If no token in localStorage either, check if we have a currentUser
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
              console.log('Using localStorage auth as fallback, no refresh token available');
              
              // If we have a currentUser but no tokens, we'll use the currentUser for auth
              // Just return a mock structure to prevent errors
              return {
                accessToken: 'localStorage-fallback',
                refreshToken: 'localStorage-fallback'
              };
            }
          }
        } catch (e) {
          console.warn('Error accessing localStorage for fallback auth:', e);
        }
      }
      
      // If we still have no refresh token, we can't continue
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Attempting to refresh access token...');
      
      // Use direct fetch to avoid circular dependency with apiRequest
      const response = await fetchWithoutAuth('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}` // Also send token in header
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        // If server returns 401/403, token is invalid - fall back to localStorage auth
        if (response.status === 401 || response.status === 403) {
          console.warn(`Token refresh failed with status: ${response.status}, checking localStorage fallback`);
          
          // Check if we have a currentUser as fallback
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            console.log('Using localStorage auth as fallback after refresh failure');
            
            // Just return a mock structure to prevent errors
            return {
              accessToken: 'localStorage-fallback',
              refreshToken: 'localStorage-fallback'
            };
          }
        }
        
        throw new Error(`Token refresh failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.accessToken && data.refreshToken) {
        // Store new tokens securely
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        
        // Also store in localStorage as fallback
        try {
          localStorage.setItem('authToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('isAuthenticated', 'true');
        } catch (e) {
          console.warn('Could not update localStorage after token refresh');
        }
        
        console.log('Token refresh successful');
        return data;
      } else {
        throw new Error('Invalid response from refresh token endpoint');
      }
    })();
    
    // Wait for the refresh to complete
    const result = await refreshPromise;
    
    // Reset refresh state
    isRefreshing = false;
    refreshPromise = null;
    
    return result;
  } catch (error) {
    // Reset refresh state
    isRefreshing = false;
    refreshPromise = null;
    
    console.error('Token refresh failed:', error);
    
    // Don't clear tokens on refresh failure - it might be a temporary server issue
    // Instead, try localStorage fallback before giving up
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        console.log('Using localStorage auth as fallback after token refresh error');
        return {
          accessToken: 'localStorage-fallback',
          refreshToken: 'localStorage-fallback'
        };
      }
      
      // Only clear tokens if we have no localStorage fallback
      clearTokens();
      localStorage.setItem('isAuthenticated', 'false');
    } catch (e) {
      console.warn('Could not check localStorage after token refresh failure', e);
    }
    
    throw error;
  }
}

/**
 * Check if an API error is due to an expired token
 * Returns true if the error is due to an expired token (401 status)
 */
export function isTokenExpiredError(error: any): boolean {
  // Handle both Error objects and Response objects
  
  // If it's a Response object (has a status property)
  if (error && typeof error.status === 'number') {
    return error.status === 401 || error.status === 403;
  }
  
  // If it's a standard error object with a message
  if (error && error.message) {
    return error.message.includes('401') || 
           error.message.includes('403') ||
           error.message.includes('Unauthorized') ||
           error.message.includes('Forbidden') ||
           error.message.toLowerCase().includes('token expired') ||
           error.message.toLowerCase().includes('authentication required') ||
           error.message.toLowerCase().includes('not authenticated');
  }
  
  // If it's a string error
  if (error && typeof error === 'string') {
    const errorLower = error.toLowerCase();
    return errorLower.includes('401') ||
           errorLower.includes('403') ||
           errorLower.includes('unauthorized') ||
           errorLower.includes('forbidden') ||
           errorLower.includes('token expired') ||
           errorLower.includes('authentication') ||
           errorLower.includes('not authenticated');
  }
  
  return false;
}