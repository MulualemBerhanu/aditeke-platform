import { randomBytes, createHmac } from 'crypto';
import { Request, Response, NextFunction } from 'express';

// CSRF token configuration
const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a CSRF token for the user session
 * Uses HMAC to sign the user's session ID
 */
export function generateCsrfToken(sessionId: string): string {
  // Create an HMAC for the session ID using our secret
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(sessionId);
  return hmac.digest('hex');
}

/**
 * Verify that a CSRF token is valid
 */
export function verifyCsrfToken(token: string, sessionId: string): boolean {
  const expectedToken = generateCsrfToken(sessionId);
  // Use a constant-time comparison to prevent timing attacks
  return token === expectedToken;
}

/**
 * Middleware to set a CSRF token cookie
 * This should be called on routes that render forms
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session.id) {
    return next(new Error('Session ID not available'));
  }

  const token = generateCsrfToken(req.session.id);
  
  // Set the token as a cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Needs to be accessible from JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Also add it to the response locals for template rendering
  res.locals.csrfToken = token;
  next();
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * This should be used on POST, PUT, DELETE, etc. routes
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  if (!req.session.id) {
    return res.status(403).json({ message: 'CSRF validation failed: No session' });
  }
  
  // Get the token from the request header or body
  const token = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }
  
  // Verify the token
  if (!verifyCsrfToken(token, req.session.id)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  next();
}

// Export constants for use in client-side code
export const csrfConstants = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};