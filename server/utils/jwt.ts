import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@shared/schema';

// Secret rotation and management
interface JwtSecrets {
  current: string;
  previous?: string; // Keep previous key for token validation during rotation
  nextRotation: number; // Timestamp when next rotation should occur
}

// Use a consistent JWT secret for both local and deployed environments
// This ensures tokens remain valid even after server restarts
const DEFAULT_JWT_SECRET = 'aditeke-software-solutions-jwt-secret-key-2025';
let jwtSecrets: JwtSecrets = {
  current: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  nextRotation: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
};

// Generate a cryptographically secure random secret
function generateSecureSecret(): string {
  // Generate a 64-byte random string
  return crypto.randomBytes(64).toString('hex');
}

// In a deployed environment, we want to keep a consistent secret
// instead of rotating it, to prevent authentication issues
// We'll only keep this for development/testing purposes
function rotateSecrets() {
  // For deployed application, we won't rotate the secret
  // This ensures users stay logged in even after server restarts
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  const now = Date.now();
  
  // Check if it's time to rotate
  if (now >= jwtSecrets.nextRotation) {
    // Keep the previous secret for a while to validate existing tokens
    jwtSecrets.previous = jwtSecrets.current;
    
    // In development, we can still generate a new secret for testing
    // In production, this would be disabled
    if (process.env.NODE_ENV !== 'production') {
      jwtSecrets.current = generateSecureSecret();
      console.log(`JWT secret rotated at ${new Date().toISOString()}`);
    }
    
    // Set next rotation time (7 days)
    jwtSecrets.nextRotation = now + (7 * 24 * 60 * 60 * 1000);
  }
}

// Only check for rotation in development, not in production
if (process.env.NODE_ENV !== 'production') {
  setInterval(rotateSecrets, 24 * 60 * 60 * 1000);
  // Initial check for rotation
  rotateSecrets();
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * Generate a JWT access token for a user
 */
export function generateAccessToken(user: Partial<User>): string {
  // Make sure to always include an ID that can be used for lookups
  if (!user.id) {
    console.warn("Warning: Generating token for user without ID", user);
  }
  
  // Create a complete payload with all necessary fields
  const payload = {
    // Standard JWT claims
    sub: user.id?.toString(),
    iat: Math.floor(Date.now() / 1000),
    
    // User identity claims - include both as id and user_id for compatibility
    id: user.id,
    user_id: user.id,
    
    // User profile data
    username: user.username,
    email: user.email,
    
    // Role and authorization data
    roleId: user.roleId,
    
    // Token type identifier
    type: 'access'
  };
  
  return jwt.sign(payload, jwtSecrets.current, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Generate a JWT refresh token for a user
 */
export function generateRefreshToken(user: Partial<User>): string {
  // Make sure we have an ID to work with
  if (!user.id) {
    console.warn("Warning: Generating refresh token for user without ID", user);
  }
  
  const payload = {
    // Standard JWT claims
    sub: user.id?.toString(),
    iat: Math.floor(Date.now() / 1000),
    
    // User identity claims - include both formats for compatibility
    id: user.id, 
    user_id: user.id,
    
    // Token type and unique identifier
    type: 'refresh',
    jti: crypto.randomBytes(16).toString('hex')
  };
  
  return jwt.sign(payload, jwtSecrets.current, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Verify a JWT token
 * Returns the decoded token payload if valid, throws an error if invalid
 */
export function verifyToken(token: string): any {
  // Get a stack trace for debugging
  const stackTrace = new Error().stack;
  
  if (!token) {
    console.error('verifyToken called with empty token');
    console.log('Stack trace for empty token:', stackTrace);
    throw new Error('Token is required');
  }
  
  if (typeof token !== 'string') {
    console.error(`verifyToken called with non-string token: ${typeof token}`);
    console.log('Stack trace for non-string token:', stackTrace);
    throw new Error('Token must be a string');
  }
  
  try {
    // Log token format for debugging (last 4 chars only for security)
    const tokenLength = token.length;
    const tokenPreview = tokenLength > 10 ? 
      `${token.substring(0, 6)}...${token.substring(tokenLength - 4)}` : 
      'invalid-token';
    console.log(`Verifying token: ${tokenPreview} (length: ${tokenLength})`);
    
    // First try with current secret
    return jwt.verify(token, jwtSecrets.current);
  } catch (error: any) {
    // Log info about the error
    console.error(`JWT verification error: ${error.name} - ${error.message}`);
    
    // If token is invalid and we have a previous secret, try that
    if (error.name === 'JsonWebTokenError' && jwtSecrets.previous) {
      try {
        console.log('Trying previous JWT secret...');
        return jwt.verify(token, jwtSecrets.previous);
      } catch (error2: any) {
        console.error(`JWT verification failed with previous secret: ${error2.name} - ${error2.message}`);
        
        // For debugging only, output full token in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Token verification failed. Debug info:');
          try {
            const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
            console.log('Token header:', decodedHeader);
          } catch (err) {
            console.log('Could not decode token header');
          }
        }
        
        throw error; // If still invalid, throw the original error
      }
    } else {
      // Add stack trace for unexpected errors
      console.error('Stack trace for JWT error:', stackTrace);
      throw error;
    }
  }
}

/**
 * Generate both access and refresh tokens for a user
 */
export function generateTokens(user: Partial<User>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

/**
 * Extract user ID from token
 */
export function getUserIdFromToken(token: string): number | undefined {
  try {
    const decoded = verifyToken(token);
    const userId = decoded.sub;
    
    if (userId) {
      return parseInt(userId, 10);
    }
    
    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Set JWT tokens in HTTP-only cookies for enhanced security
 */
export function setTokenCookies(res: any, tokens: { accessToken: string, refreshToken: string }) {
  // Check if we're in a Replit environment (works for both replit.dev and replit.app)
  const isReplitEnv = process.env.REPL_ID || 
    (typeof window !== 'undefined' && (
      window.location.host.includes('.replit.dev') || 
      window.location.host.includes('.replit.app')
    ));
  
  // In Replit environments, we need to ensure cookies work properly
  const cookieOptions = {
    httpOnly: true,  // Prevents JavaScript access
    // Only use secure cookies in production non-Replit environments
    // For Replit environments, we'll skip the secure flag to ensure cookies work
    secure: process.env.NODE_ENV === 'production' && !isReplitEnv,
    sameSite: isReplitEnv ? 'none' : 'lax', // For cross-site cookies in Replit
    // Add path to ensure cookies are sent for all routes
    path: '/'
  };
  
  // Set access token cookie (short-lived)
  res.cookie('access_token', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  });
  
  // Set refresh token cookie (long-lived)
  res.cookie('refresh_token', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
  
  // Log cookie settings for debugging
  console.log('Cookie settings:', {
    inReplit: isReplitEnv,
    environment: process.env.NODE_ENV,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite
  });
}

/**
 * Clear JWT tokens from cookies
 */
export function clearTokenCookies(res: any) {
  // Check if we're in a Replit environment (works for both replit.dev and replit.app)
  const isReplitEnv = process.env.REPL_ID || 
    (typeof window !== 'undefined' && (
      window.location.host.includes('.replit.dev') || 
      window.location.host.includes('.replit.app')
    ));
  
  // Make sure to match the same options we used when setting the cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isReplitEnv,
    sameSite: isReplitEnv ? 'none' : 'lax',
    path: '/'
  };
  
  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
  
  console.log('Cleared auth cookies with options:', cookieOptions);
}

/**
 * Check if a token is about to expire
 * Returns true if token expires within the next 5 minutes
 */
export function isTokenAboutToExpire(token: string): boolean {
  try {
    const decoded = verifyToken(token);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Check if token expires within 5 minutes
    return expiryTime - now < 5 * 60 * 1000;
  } catch (error) {
    // If token verification fails, consider it about to expire
    return true;
  }
}

/**
 * Extract JWT token from the request
 * Checks for token in Authorization header, cookies, or query parameter
 */
export function extractJwtFromRequest(req: any): string | undefined {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  // Check cookies (for server-to-server communication)
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  
  // Check query parameter (less secure, used for special cases like WebSocket connections)
  if (req.query?.token) {
    return req.query.token as string;
  }
  
  return undefined;
}

/**
 * Middleware to automatically refresh tokens if they are about to expire
 */
export function refreshTokenMiddleware(req: any, res: any, next: any) {
  try {
    // Get the current access token
    const accessToken = extractJwtFromRequest(req);
    
    // If no token, just continue
    if (!accessToken) {
      return next();
    }
    
    // Check if the token is about to expire
    if (isTokenAboutToExpire(accessToken)) {
      // Get refresh token from cookies
      const refreshToken = req.cookies?.refresh_token;
      
      // If no refresh token, just continue with the current token
      if (!refreshToken) {
        return next();
      }
      
      try {
        // Verify the refresh token
        const decoded = verifyToken(refreshToken);
        
        // Make sure it's actually a refresh token
        if (decoded.type !== 'refresh') {
          return next();
        }
        
        // Get user ID from the refresh token
        const userId = parseInt(decoded.sub, 10);
        
        // This is a simplified version. In a real app, you would:
        // 1. Fetch the user from the database using userId
        // 2. Verify the refresh token hasn't been revoked
        // 3. Generate new tokens
        
        // For now, we'll just create a minimal user object
        const user = { id: userId };
        
        // Generate new tokens
        const newTokens = generateTokens(user);
        
        // Set the new tokens in cookies
        setTokenCookies(res, newTokens);
        
        // Log the refresh
        console.log(`Automatically refreshed tokens for user ${userId}`);
      } catch (error) {
        // If refresh token is invalid, just continue with the current token
        console.error('Failed to refresh token:', error);
      }
    }
    
    next();
  } catch (error) {
    // If any error occurs, log it and continue
    console.error('Error in refresh token middleware:', error);
    next();
  }
}