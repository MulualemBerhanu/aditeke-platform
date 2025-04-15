import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@shared/schema';

// Secret rotation and management
interface JwtSecrets {
  current: string;
  previous?: string; // Keep previous key for token validation during rotation
  nextRotation: number; // Timestamp when next rotation should occur
}

// In-memory secrets (will reset on server restart, which is fine for security)
let jwtSecrets: JwtSecrets = {
  current: process.env.JWT_SECRET || generateSecureSecret(),
  nextRotation: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
};

// Generate a cryptographically secure random secret
function generateSecureSecret(): string {
  // Generate a 64-byte random string
  return crypto.randomBytes(64).toString('hex');
}

// Rotate secrets periodically
function rotateSecrets() {
  const now = Date.now();
  
  // Check if it's time to rotate
  if (now >= jwtSecrets.nextRotation) {
    // Keep the previous secret for a while to validate existing tokens
    jwtSecrets.previous = jwtSecrets.current;
    
    // Generate a new secret
    jwtSecrets.current = generateSecureSecret();
    
    // Set next rotation time (7 days)
    jwtSecrets.nextRotation = now + (7 * 24 * 60 * 60 * 1000);
    
    console.log(`JWT secret rotated at ${new Date().toISOString()}`);
  }
}

// Check for secret rotation every day
setInterval(rotateSecrets, 24 * 60 * 60 * 1000);

// Initial check for rotation
rotateSecrets();

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * Generate a JWT access token for a user
 */
export function generateAccessToken(user: Partial<User>): string {
  const payload = {
    sub: user.id?.toString(),
    username: user.username,
    email: user.email,
    roleId: user.roleId,
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
  const payload = {
    sub: user.id?.toString(),
    type: 'refresh',
    // Include a unique token identifier for revocation if needed
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
  try {
    // First try with current secret
    return jwt.verify(token, jwtSecrets.current);
  } catch (error: any) {
    // If token is invalid and we have a previous secret, try that
    if (error.name === 'JsonWebTokenError' && jwtSecrets.previous) {
      try {
        return jwt.verify(token, jwtSecrets.previous);
      } catch (error2) {
        throw error; // If still invalid, throw the original error
      }
    } else {
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
  // Set access token cookie (short-lived)
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,  // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'lax', // Helps prevent CSRF
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  });
  
  // Set refresh token cookie (long-lived)
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
}

/**
 * Clear JWT tokens from cookies
 */
export function clearTokenCookies(res: any) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
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