/**
 * Get CSRF token from the meta tag
 */
export function getCSRFToken(): string | null {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFTokenToHeaders(headers: HeadersInit = {}): Headers {
  const csrfToken = getCSRFToken();
  const newHeaders = new Headers(headers);
  
  if (csrfToken && csrfToken !== "__CSRF_TOKEN__") {
    newHeaders.append('X-CSRF-Token', csrfToken);
  }
  
  return newHeaders;
}