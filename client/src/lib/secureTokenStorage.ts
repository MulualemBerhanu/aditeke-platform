/**
 * Secure token storage utility
 * Prioritizes HTTP-only cookies over localStorage for better security
 * Falls back to localStorage only for cross-domain scenarios
 */

// Check if we're in a cross-domain environment
const isCrossDomain = () => {
  const appHost = window.location.host;
  return appHost.includes('.replit.app') || appHost.includes('.replit.dev');
};

// Utility to detect if cookies are working properly
const areCookiesEnabled = () => {
  try {
    document.cookie = "cookietest=1";
    const result = document.cookie.indexOf("cookietest=") !== -1;
    document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    return result;
  } catch (e) {
    return false;
  }
};

// Get the auth mode (cookie-first or localStorage-only)
const getAuthMode = (): 'cookie-first' | 'localStorage-only' => {
  // Force localStorage in cross-domain environments where cookies might not work
  if (isCrossDomain() || !areCookiesEnabled()) {
    return 'localStorage-only';
  }
  return 'cookie-first';
};

// Store token with appropriate security measures
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  // Always store refresh token in localStorage (it's needed for token refresh)
  localStorage.setItem('refreshToken', refreshToken);
  
  // For access token, use cookie-first approach when possible
  if (getAuthMode() === 'localStorage-only') {
    localStorage.setItem('accessToken', accessToken);
    // Add a flag to indicate we're using localStorage for tokens
    localStorage.setItem('tokenStorageMethod', 'localStorage');
  } else {
    // In cookie-first mode, don't duplicate the token in localStorage
    // The HTTP-only cookie set by the server is used instead
    localStorage.removeItem('accessToken');
    localStorage.setItem('tokenStorageMethod', 'cookie');
  }
};

// Get access token with fallback
export const getAccessToken = (): string | null => {
  // In localStorage mode, get from there
  if (getAuthMode() === 'localStorage-only' || localStorage.getItem('tokenStorageMethod') === 'localStorage') {
    return localStorage.getItem('accessToken');
  }
  
  // In cookie mode, return null since the cookie is HTTP-only and not accessible from JS
  // The API middleware will extract it from the cookie automatically
  return null;
};

// Get refresh token (always from localStorage)
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Clear all tokens
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenStorageMethod');
};

// Check if user is likely authenticated (for initial UI decisions)
export const hasStoredTokens = (): boolean => {
  const hasRefreshToken = !!getRefreshToken();
  const hasAccessToken = getAuthMode() === 'localStorage-only' 
    ? !!localStorage.getItem('accessToken') 
    : localStorage.getItem('tokenStorageMethod') === 'cookie';
  
  return hasAccessToken || hasRefreshToken;
};