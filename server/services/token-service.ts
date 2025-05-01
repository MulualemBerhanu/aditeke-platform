/**
 * Token Service
 * Manages secure token generation, verification, and storage for password resets
 */

import { randomBytes } from 'crypto';
import { db } from '../db';
import { passwordResetTokens } from '@shared/schema';
import { eq, and, lt, gt } from 'drizzle-orm';

// Token validity period in milliseconds (24 hours)
const TOKEN_VALIDITY_PERIOD = 24 * 60 * 60 * 1000;

/**
 * Get the token validity period in hours
 * @returns Token validity period in hours
 */
export function getTokenValidityPeriod(): number {
  return TOKEN_VALIDITY_PERIOD / (60 * 60 * 1000);
}

/**
 * Create a new password reset token for a user
 * @param userId ID of the user requesting a password reset
 * @returns Generated token
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  try {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + TOKEN_VALIDITY_PERIOD);
    
    // Store the token in the database
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    });
    
    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw new Error('Failed to create password reset token');
  }
}

/**
 * Verify if a token is valid and not expired
 * @param token Token to verify
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  try {
    // Get current time
    const now = new Date();
    
    // Find the token in the database
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, now)
        )
      );
    
    // If token is not found or expired, return null
    if (!tokenRecord) {
      return null;
    }
    
    // Return the user ID associated with the token
    return tokenRecord.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Invalidate a token after it has been used
 * @param token Token to invalidate
 */
export async function invalidateToken(token: string): Promise<void> {
  try {
    // Delete the token from the database
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
  } catch (error) {
    console.error('Error invalidating token:', error);
    throw new Error('Failed to invalidate token');
  }
}

/**
 * Clean up expired tokens from the database
 * This should be run periodically to remove unused tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const now = new Date();
    
    // Delete all tokens that have expired
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, now));
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw new Error('Failed to clean up expired tokens');
  }
}