/**
 * Authentication and User Account Management Routes
 * Includes functionality for handling welcome emails and password resets
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { hashPassword, validatePasswordStrength, comparePasswords } from '../services/password-service';
import { sendPasswordResetEmail } from '../services/email-service';
import { createPasswordResetToken, verifyPasswordResetToken, invalidateToken, getTokenValidityPeriod } from '../services/token-service';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Request password reset endpoint
 * Generates a reset token and sends an email with the reset link
 */
router.post('/request-password-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // Generate reset token
    const token = await createPasswordResetToken(user.id);
    
    // Create reset link with token
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    
    // Get token validity period in hours
    const expiryTime = getTokenValidityPeriod();
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      username: user.username,
      resetLink,
      expiryTime
    });
    
    if (!emailSent) {
      console.error(`Failed to send password reset email to ${user.email}`);
      return res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
    }
    
    return res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

/**
 * Verify reset token endpoint
 * Checks if a token is valid before showing the password reset form
 */
router.get('/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Verify token and get user ID
    const userId = await verifyPasswordResetToken(token);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the token' });
  }
});

/**
 * Reset password endpoint
 * Allows a user to set a new password using a valid token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Verify token and get user ID
    const userId = await verifyPasswordResetToken(token);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user's password
    await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        updatedAt: new Date(),
        passwordResetRequired: false  // Clear the password reset flag
      })
      .where(eq(users.id, userId));
    
    // Invalidate the token so it cannot be used again
    await invalidateToken(token);
    
    // Return success
    return res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'An error occurred while resetting your password' });
  }
});

/**
 * Set new password for first login endpoint
 * Used when a user with passwordResetRequired=true logs in
 */
router.post('/set-new-password', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to set a new password' });
    }
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const passwordCorrect = await comparePasswords(currentPassword, user.password);
    if (!passwordCorrect) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user's password
    await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        updatedAt: new Date(),
        passwordResetRequired: false  // Clear the password reset flag
      })
      .where(eq(users.id, userId));
    
    // Return success
    return res.status(200).json({ 
      message: 'Password changed successfully',
      user: {
        ...req.user,
        passwordResetRequired: false
      }
    });
  } catch (error) {
    console.error('Error setting new password:', error);
    return res.status(500).json({ error: 'An error occurred while setting your new password' });
  }
});

export default router;