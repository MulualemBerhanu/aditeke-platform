/**
 * Token Service
 * Manages secure token generation, verification, and storage for password resets
 */

import { randomBytes } from 'crypto';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { passwordResetTokens } from '@shared/schema';

// Token validity period in hours
const TOKEN_VALIDITY_HOURS = 24;

/**
 * Get the token validity period in hours
 * @returns Token validity period in hours
 */
export function getTokenValidityPeriod(): number {
  return TOKEN_VALIDITY_HOURS;
}

/**
 * Create a new password reset token for a user
 * @param userId ID of the user requesting a password reset
 * @returns Generated token
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Calculate expiration time (current time + validity period)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_VALIDITY_HOURS);
  
  // Store the token in database using raw SQL to avoid type issues
  await db.execute(
    `INSERT INTO "password_reset_tokens" ("token", "user_id", "expires_at", "created_at", "used")
     VALUES ($1, $2, $3, $4, $5)`,
    [token, userId, expiresAt.toISOString(), new Date().toISOString(), false]
  );
  
  console.log(`Password reset token created for user ${userId}, expires at ${expiresAt.toISOString()}`);
  return token;
}

/**
 * Verify if a token is valid and not expired
 * @param token Token to verify
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const now = new Date().toISOString();
  
  // Find the token in database using raw SQL
  const { rows } = await db.execute(
    `SELECT * FROM "password_reset_tokens" WHERE "token" = $1`,
    [token]
  );
  
  // Check if we got results
  if (!rows || rows.length === 0) {
    console.log('Token validation failed: not found');
    return null;
  }
  
  const resetToken = rows[0];
  
  // Check if token is not expired, and has not been used
  if (resetToken.expires_at < now || resetToken.used) {
    console.log(`Token validation failed: ${resetToken.used ? 'already used' : 'expired'}`);
    return null;
  }
  
  return resetToken.user_id;
}

/**
 * Invalidate a token after it has been used
 * @param token Token to invalidate
 */
export async function invalidateToken(token: string): Promise<void> {
  // Using raw SQL to avoid type issues
  await db.execute(
    `UPDATE "password_reset_tokens" 
     SET "used" = true, "updated_at" = $1
     WHERE "token" = $2`,
    [new Date().toISOString(), token]
  );
  
  console.log(`Token ${token} has been marked as used`);
}

/**
 * Clean up expired tokens from the database
 * This should be run periodically to remove unused tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date().toISOString();
  
  // Delete all expired tokens using raw SQL to avoid type issues
  await db.execute(`DELETE FROM "password_reset_tokens" WHERE "expires_at" < $1`, [now]);
  
  console.log('Expired password reset tokens have been cleaned up');
}