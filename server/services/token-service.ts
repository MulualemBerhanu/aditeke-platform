/**
 * Token Service for handling password reset tokens
 * Includes functionality for creating, verifying, and invalidating tokens
 */

import { randomBytes, createHash } from 'crypto';
import { db } from '../db';
import { passwordResetTokens } from '@shared/schema';
import { eq, lt } from 'drizzle-orm';

// Token validity period in minutes
const TOKEN_VALIDITY_MINUTES = 60;

/**
 * Generate a secure random token
 * @returns Random token string
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage
 * @param token Plain token
 * @returns Hashed token
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a password reset token for a user
 * @param userId User ID
 * @returns Plain token (to be sent in email)
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // First, invalidate any existing tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  
  // Generate a new token
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  
  // Calculate expiry time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_VALIDITY_MINUTES);
  
  // Save the token
  await db.insert(passwordResetTokens).values({
    userId,
    token: hashedToken,
    expiresAt,
    createdAt: new Date(),
  });
  
  return token;
}

/**
 * Verify if a token is valid
 * @param token Plain token
 * @returns User ID if valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const hashedToken = hashToken(token);
  const now = new Date();
  
  // Find token, ensure it's not expired
  const [result] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, hashedToken))
    .where(lt(now, passwordResetTokens.expiresAt));
  
  if (!result) {
    return null;
  }
  
  return result.userId;
}

/**
 * Invalidate a token after use
 * @param token Plain token
 */
export async function invalidateToken(token: string): Promise<void> {
  const hashedToken = hashToken(token);
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, hashedToken));
}

/**
 * Clean up expired tokens (utility function to be called periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, now));
}

/**
 * Get token validity period in minutes
 */
export function getTokenValidityPeriod(): number {
  return TOKEN_VALIDITY_MINUTES;
}