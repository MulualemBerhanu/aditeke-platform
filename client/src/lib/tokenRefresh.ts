import { apiRequest } from './queryClient';

// Track if a refresh is already in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

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
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Refreshing access token...');
      const response = await apiRequest('POST', '/api/refresh-token', { refreshToken });
      const data = await response.json();
      
      if (data.accessToken && data.refreshToken) {
        // Store new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
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
    
    // Clear tokens on refresh failure - user needs to login again
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
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