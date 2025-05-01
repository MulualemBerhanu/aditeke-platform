/**
 * Authentication and User Account Management Routes
 * Includes functionality for handling welcome emails and password resets
 */

import { Router } from "express";
import { generateSecurePassword, hashPassword, comparePasswords, validatePasswordStrength } from '../services/password-service';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email-service';
import { createPasswordResetToken, verifyPasswordResetToken, invalidateToken, getTokenValidityPeriod } from '../services/token-service';
import { db } from '../db';
import { users, passwordResetTokens } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a router instance
const router = Router();

/**
 * Request password reset endpoint
 * Generates a reset token and sends an email with the reset link
 */
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists with this email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is in our system, you will receive a password reset link shortly.' 
      });
    }

    // Generate reset token
    const token = await createPasswordResetToken(user.id);

    // Create reset link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://aditeke.com'
      : 'http://localhost:5000';
    
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send password reset email
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      username: user.username,
      resetLink,
      expiryTime: getTokenValidityPeriod()
    });

    return res.status(200).json({ 
      message: 'If your email is in our system, you will receive a password reset link shortly.' 
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * Verify reset token endpoint
 * Checks if a token is valid before showing the password reset form
 */
router.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const userId = await verifyPasswordResetToken(token);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ error: 'Failed to verify token' });
  }
});

/**
 * Reset password endpoint
 * Allows a user to set a new password using a valid token
 */
router.post('/reset-password', async (req, res) => {
  const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8)
  });

  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Verify token and get userId
    const userId = await verifyPasswordResetToken(token);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the user's password and unset the passwordResetRequired flag
    await db.update(users)
      .set({ 
        password: hashedPassword,
        passwordResetRequired: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Invalidate the token to prevent reuse
    await invalidateToken(token);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * Set new password for first login endpoint
 * Used when a user with passwordResetRequired=true logs in
 */
router.post('/set-new-password', async (req, res) => {
  // User must be authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    // Get the user
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If this is not a first login, require the current password
    if (!user.passwordResetRequired && !currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    // If not first login, verify current password
    if (!user.passwordResetRequired) {
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Hash and update the new password
    const hashedPassword = await hashPassword(newPassword);
    
    await db.update(users)
      .set({ 
        password: hashedPassword,
        passwordResetRequired: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error setting new password:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;