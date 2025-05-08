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
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Refreshing access token...');
      
      // Use direct fetch to avoid circular dependency with apiRequest
      const response = await fetchWithoutAuth('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.accessToken && data.refreshToken) {
        // Store new tokens securely
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        
        console.log('Token refresh successful');
        
        // Update localStorage currentUser as fallback
        try {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            localStorage.setItem('isAuthenticated', 'true');
          }
        } catch (e) {
          console.warn('Could not update localStorage after token refresh');
        }
        
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
    
    // Clear tokens on refresh failure - user needs to login again
    clearTokens();
    
    // Set localStorage auth state to false
    try {
      localStorage.setItem('isAuthenticated', 'false');
    } catch (e) {
      console.warn('Could not update localStorage after token refresh failure');
    }
    
    throw error;
  }
}

/**
 * Check if an API error is due to an expired token
 * Returns true if the error is due to an expired token (401 status)
 */
export function isTokenExpiredError(error: any): boolean {
  return error && 
         (error.message.includes('401') || 
          error.message.includes('Unauthorized') ||
          error.message.toLowerCase().includes('token expired'));
}