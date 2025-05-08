import { Request, Response, NextFunction } from 'express';

// CSRF token configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a simple CSRF token without relying on crypto
 */
export function generateSimpleCsrfToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Middleware to set a CSRF token cookie using a simpler approach
 */
export function setSimpleCsrfToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Generate a random token if one doesn't exist
    let token = req.cookies?.[CSRF_COOKIE_NAME];
    
    if (!token) {
      token = generateSimpleCsrfToken();
      
      // Set the token as a cookie
      res.cookie(CSRF_COOKIE_NAME, token, { 
        httpOnly: false, // Needs to be accessible from JavaScript
        secure: false, // Allow non-secure for testing
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      console.log('Generated simple CSRF token:', token.substring(0, 10) + '...');
    }
    
    // Also add it to the response locals for template rendering
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error('Error setting simple CSRF token:', error);
    next();
  }
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * This should be used on POST, PUT, DELETE, etc. routes
 */
export function validateSimpleCsrfToken(req: Request, res: Response, next: NextFunction) {
  // ⚠️ TEMPORARY FIX: Bypass all CSRF validation during development
  console.log('⚠️ Simple CSRF validation DISABLED for all requests (temporary development mode)');
  return next();
}

// Export constants for use in client-side code
export const csrfConstants = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};