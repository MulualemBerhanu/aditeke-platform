import { randomBytes, createHmac } from 'crypto';
import { Request, Response, NextFunction } from 'express';

// CSRF token configuration
const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Store generated tokens in memory (alternative approach without relying on sessions)
// In a production app, you'd want to use a Redis store or similar
const csrfTokenStore = new Map<string, string>();

/**
 * Generate a new random CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Middleware to set a CSRF token cookie
 * This should be called on all routes to ensure the token is available
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Generate a random token if one doesn't exist
    let token = req.cookies?.[CSRF_COOKIE_NAME];
    
    if (!token) {
      token = generateCsrfToken();
      
      // Store the token for validation
      csrfTokenStore.set(token, new Date().toISOString());
      
      // Set the token as a cookie
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Needs to be accessible from JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    // Also add it to the response locals for template rendering
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error('Error setting CSRF token:', error);
    next();
  }
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * This should be used on POST, PUT, DELETE, etc. routes
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Skip validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Get the token from the request header or body
    const token = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string || req.body?._csrf;
    
    // Get the cookie token
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    
    // Simple validation - token in header must match token in cookie
    if (!token || !cookieToken || token !== cookieToken) {
      // If API request, return JSON response
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({ message: 'CSRF validation failed' });
      }
      
      // For other requests, redirect to home page
      return res.redirect('/');
    }
    
    next();
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    
    // If API request, return JSON response
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ message: 'CSRF validation error' });
    }
    
    // For other requests, redirect to home page
    return res.redirect('/');
  }
}

// Clean up old tokens periodically
setInterval(() => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  csrfTokenStore.forEach((timestamp, token) => {
    const tokenDate = new Date(timestamp).getTime();
    if (now - tokenDate > day) {
      csrfTokenStore.delete(token);
    }
  });
}, 60 * 60 * 1000); // Clean up every hour

// Export constants for use in client-side code
export const csrfConstants = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};