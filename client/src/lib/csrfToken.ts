/**
 * CSRF protection utility for client-side requests
 * This module handles CSRF token retrieval and inclusion in API requests
 */

// CSRF token configuration - must match server configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Get the CSRF token from cookies
 * @returns The CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  console.log('Debug - All cookies:', document.cookie);
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    console.log('Debug - Cookie:', name, value);
    
    if (name === CSRF_COOKIE_NAME) {
      console.log('Debug - Found CSRF token in cookies:', value);
      return decodeURIComponent(value);
    }
  }
  
  console.log('Debug - CSRF token not found in cookies');
  return null;
}

/**
 * Add CSRF token header to fetch options
 * Use this to add the CSRF protection to your API requests
 * 
 * @param options - The original fetch options
 * @returns Modified fetch options with CSRF header
 */
export function addCsrfHeader(options: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  if (!token) {
    console.warn('CSRF token not found in cookies');
    return options;
  }

  // Create or update headers with CSRF token
  const headers = new Headers(options.headers || {});
  headers.set(CSRF_HEADER_NAME, token);

  return {
    ...options,
    headers,
  };
}

/**
 * Wrapper for fetch that automatically adds CSRF token
 * Use this instead of regular fetch for API calls that modify state
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise from the fetch call
 */
export function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  // Only add CSRF for non-GET requests that change state
  if (!options.method || options.method === 'GET') {
    console.log('Debug - Skipping CSRF for GET request');
    return fetch(url, options);
  }
  
  // Manually include CSRF token cookie value in header for testing
  const token = getCsrfToken();
  const optionsWithCsrf = addCsrfHeader(options);
  
  console.log('Debug - Sending request with CSRF token:', token);
  console.log('Debug - Request URL:', url);
  console.log('Debug - Request method:', options.method);
  
  // Create a proper RequestInit object with credentials
  const finalOptions: RequestInit = {
    ...optionsWithCsrf,
    credentials: 'include'
  };
  
  return fetch(url, finalOptions);
}

/**
 * Export constants for use in other modules
 */
export const csrfConstants = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};