import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { NextFunction, Request, Response } from 'express';

// We would normally use environment variables for these secrets
// In production, use a strong random string as the secret
const JWT_SECRET = process.env.JWT_SECRET || 'aditeke-software-solutions-jwt-secret-key';
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// User data that will be encoded in tokens
export type UserTokenData = {
  id: number;
  username: string;
  roleId: number | string;
};

/**
 * Generate an access token for a user
 */
export function generateAccessToken(user: UserTokenData) {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      roleId: user.roleId 
    }, 
    JWT_SECRET, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(user: UserTokenData) {
  return jwt.sign(
    { 
      userId: user.id,
      tokenType: 'refresh' 
    }, 
    JWT_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): UserTokenData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // For access tokens
    if (decoded.userId && decoded.username) {
      return {
        id: decoded.userId,
        username: decoded.username,
        roleId: decoded.roleId
      };
    }
    
    // For refresh tokens
    if (decoded.userId && decoded.tokenType === 'refresh') {
      return {
        id: decoded.userId,
        username: '', // Refresh tokens don't contain username
        roleId: 0     // Refresh tokens don't contain roleId
      };
    }
    
    return null;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Generate both access and refresh tokens for a user
 */
export function generateTokens(user: UserTokenData) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

/**
 * Extract JWT from request
 * Looks in: Authorization header, cookies, and query params
 */
export function extractJwtFromRequest(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  // Check query params (not recommended for production)
  if (req.query && req.query.token) {
    return req.query.token as string;
  }
  
  return null;
}

/**
 * JWT Authentication middleware
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractJwtFromRequest(req);
  
  if (!token) {
    return next(); // Let the next middleware handle unauthenticated requests
  }
  
  const userData = verifyToken(token);
  if (userData) {
    // Attach the user info to the request
    (req as any).user = userData;
    return next();
  }
  
  return next(); // Continue to the next middleware
}