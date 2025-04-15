import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

// Token cache to store valid CSRF tokens
const tokenCache = new Map<string, number>();

// Clean expired tokens periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // Remove tokens that are older than 24 hours
  // Using Array.from to avoid iterator issues in older TS targets
  Array.from(tokenCache.keys()).forEach(token => {
    const timestamp = tokenCache.get(token)!;
    const ageInMilliseconds = now - timestamp;
    
    if (ageInMilliseconds > maxAge) {
      tokenCache.delete(token);
    }
  });
}, 60 * 60 * 1000); // Run cleanup hourly

/**
 * Generate a secure random token
 */
export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokenCache.set(token, Date.now());
  return token;
}

/**
 * Verify if a CSRF token is valid
 */
export function verifyCSRFToken(token: string): boolean {
  return tokenCache.has(token);
}

/**
 * Middleware to inject CSRF token into HTML responses
 */
export function injectCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Store the original send method
  const originalSend = res.send;
  
  // Generate a new token for this request
  const csrfToken = generateCSRFToken();
  
  // Override the send method
  res.send = function(body?: any): Response {
    // Only modify HTML responses
    if (body && typeof body === 'string' && res.getHeader('content-type')?.toString().includes('text/html')) {
      // Replace the placeholder with the actual token
      const modifiedBody = body.replace('__CSRF_TOKEN__', csrfToken);
      
      // Call the original send method with the modified body
      return originalSend.call(this, modifiedBody);
    }
    
    // Call the original send method for non-HTML responses
    return originalSend.call(this, body);
  };
  
  next();
}

/**
 * Middleware to protect against CSRF attacks
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip for GET, HEAD, OPTIONS requests as they should be idempotent
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Check for CSRF token in header
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  if (!csrfToken || !verifyCSRFToken(csrfToken)) {
    // In development, we might want to just log the error
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSRF token validation failed. This would be blocked in production.');
      return next();
    }
    
    // In production, return a 403 Forbidden
    return res.status(403).json({ 
      message: 'Invalid or missing CSRF token',
      error: 'FORBIDDEN' 
    });
  }
  
  next();
}