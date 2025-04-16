import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserIdFromToken, isTokenAboutToExpire, generateAccessToken, generateRefreshToken } from './jwt';
import { storage } from '../storage';

/**
 * Middleware to authenticate requests using JWT tokens
 * This middleware checks for JWT in Authorization header, cookies, or query param
 * If token is valid but about to expire, it issues a new one
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // For debugging - log the headers to see what's coming through
  console.log('Auth Headers:', req.headers);
  
  // Get token from Authorization header (Bearer token)
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no token in header, check cookies
  if (!token && req.cookies) {
    token = req.cookies.access_token;
  }
  
  // If still no token and we're in a cross-domain situation, check query param
  // This is less secure but necessary for some cross-domain scenarios
  if (!token && req.query && req.query.token) {
    token = req.query.token as string;
  }
  
  // Special case for development environment - allow public endpoints or hardcoded credentials
  if (process.env.NODE_ENV === 'development' && (!token || req.path.includes('/client-invoices'))) {
    console.log('Development mode: Auth skipped for:', req.path);
    req.user = {
      id: 50000, // Default to a manager ID for development
      username: 'manager',
      email: 'manager@aditeke.com',
      roleId: 1000, // Manager role
      name: 'Manager User',
      password: '',
      createdAt: new Date(),
      updatedAt: null,
      profilePicture: null,
      lastLogin: null,
      isActive: true,
      company: 'AdiTeke Software Solutions',
      phone: null,
      website: null,
      address: null,
      notes: null,
      isVip: null,
      isPriority: null,
    };
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify the token
    const decoded = verifyToken(token);
    
    // Check token type, but be more lenient in development
    if (decoded.type !== 'access' && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Set user info in request for use in route handlers
    req.user = {
      id: parseInt(decoded.sub, 10),
      username: decoded.username,
      email: decoded.email,
      roleId: decoded.roleId,
      // Add these required properties with sensible defaults
      name: decoded.name || decoded.username,
      password: '', // We never expose the actual password
      createdAt: new Date(),
      updatedAt: null,
      profilePicture: null,
      lastLogin: null,
      isActive: true
    };
    
    // Check if token is about to expire and issue a new one if so
    if (isTokenAboutToExpire(token)) {
      const newToken = generateAccessToken(req.user);
      
      // Set the new token in the response header
      res.setHeader('X-New-Access-Token', newToken);
      
      // Also set it as a cookie if we're using cookies
      if (req.cookies && req.cookies.access_token) {
        res.cookie('access_token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
      }
    }
    
    next();
  } catch (error) {
    // Log the error but don't expose details to client
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
}

/**
 * Middleware to check if user has required permissions
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const hasPermission = await storage.hasPermission(
        req.user.id,
        resource,
        action
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          message: `You don't have permission to ${action} ${resource}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      return res.status(500).json({ message: 'Server error during permission check' });
    }
  };
}

/**
 * Middleware to require a specific role
 */
export function requireRole(roleId: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.roleId !== roleId) {
      return res.status(403).json({
        message: 'You do not have the required role to access this resource'
      });
    }
    
    next();
  };
}

/**
 * Middleware to handle token refresh
 */
export async function handleTokenRefresh(req: Request, res: Response) {
  // Get refresh token from request body or cookie
  const refreshToken = req.body.refreshToken || req.cookies?.refresh_token;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }
  
  try {
    // Verify the refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if it's actually a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(400).json({ message: 'Invalid token type' });
    }
    
    // Get the user ID from the token
    const userId = parseInt(decoded.sub, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }
    
    // Get the user from the database
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a user object that meets the requirements for token generation
    const userForToken = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      name: user.name,
      // Add required fields with sensible defaults
      password: '', // We don't include the actual password
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    };
    
    // Generate new tokens
    const accessToken = generateAccessToken(userForToken);
    // For security, we generate a new refresh token each time
    const newRefreshToken = generateRefreshToken(userForToken);
    
    // Set tokens in cookies for added security
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Also send tokens in response body for cross-domain scenarios
    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

// Function to extract user ID from token
export function getUserFromToken(req: Request): number | undefined {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined;
  }
  
  const token = authHeader.split(' ')[1];
  return getUserIdFromToken(token);
}

// The generateRefreshToken function is imported from jwt.ts