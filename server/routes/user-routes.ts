/**
 * User management routes for creating and managing users
 * Includes functionality for sending welcome emails with temporary passwords
 */

import { Router } from "express";
import { generateTemporaryPassword, hashPassword } from '../services/password-service';
import { sendWelcomeEmail } from '../services/email-service';
import { sendWelcomeEmail as sendNodemailerWelcomeEmail } from '../utils/nodemailerService';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a router instance
const router = Router();

/**
 * Create a new user with welcome email and temporary password
 * Only accessible to administrators and managers
 */
router.post('/users', async (req, res) => {
  // Check if user is authenticated and has proper permission
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // For now, allow managers and admins to create users
  const userRole = req.user?.roleId;
  if (userRole !== 1000 && userRole !== 1002) { // 1000 = manager, 1002 = admin
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  try {
    // Validate input
    const createUserSchema = z.object({
      username: z.string().email(),
      email: z.string().email(),
      name: z.string().min(1),
      roleId: z.number(),
      company: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
      industry: z.string().optional(),
      referralSource: z.string().optional(),
      isVip: z.boolean().optional(),
      isPriority: z.boolean().optional(),
      isActive: z.boolean().optional(),
      profilePicture: z.string().optional(),
    });

    const userData = createUserSchema.parse(req.body);
    
    // Check if username or email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));
    
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate a secure temporary password
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create the user with password reset required flag
    const [createdUser] = await db.insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        passwordResetRequired: true,
        createdAt: new Date()
      })
      .returning();

    // Create login link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://aditeke.com'
      : 'http://localhost:5000';
    
    const loginLink = `${baseUrl}/login?username=${encodeURIComponent(userData.username)}`;

    // Send welcome email with temporary password
    try {
      console.log(`Attempting to send welcome email to ${userData.email} for user ${userData.username}`);
      
      // First try with Nodemailer service (more reliable, no IP restrictions)
      try {
        console.log('Attempting to send welcome email with Nodemailer...');
        
        const emailResult = await sendNodemailerWelcomeEmail({
          email: userData.email,
          name: userData.name,
          username: userData.username,
          temporaryPassword: tempPassword
        });
        
        if (emailResult) {
          console.log('Welcome email sent successfully via Nodemailer');
          return;  // Exit if nodemailer succeeds
        }
      } catch (nodemailerError) {
        console.error('Nodemailer email failed, falling back to Brevo:', nodemailerError);
      }
      
      // Fallback to Brevo API if Nodemailer fails
      console.log('Falling back to Brevo API for welcome email...');
      
      await sendWelcomeEmail({
        email: userData.email,
        name: userData.name,
        username: userData.username,
        temporaryPassword: tempPassword
      });
      
      console.log(`Welcome email sent to ${userData.email} via Brevo API`);
    } catch (emailError) {
      console.error('Error sending welcome email with all methods:', emailError);
      // We still return success since the user was created,
      // but log the email error
    }

    // Return the created user (without password)
    const { password, ...userWithoutPassword } = createdUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * Get user information (for checking if password reset is required)
 * The route is used to determine if a user needs to reset their password after login
 */
router.get('/user-info', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Get the current user info
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        passwordResetRequired: users.passwordResetRequired,
      })
      .from(users)
      .where(eq(users.id, req.user.id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user information:', error);
    return res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

/**
 * Delete a user by ID
 * Only accessible to administrators and managers
 */
router.delete('/users/:id', async (req, res) => {
  // Check if user is authenticated and has proper permission
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // For now, allow managers and admins to delete users
  const userRole = req.user?.roleId;
  if (userRole !== 1000 && userRole !== 1002) { // 1000 = manager, 1002 = admin
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get the user to be deleted to ensure they exist
    const [userToDelete] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deletion of managers or admins through this endpoint
    if (userToDelete.roleId === 1000 || userToDelete.roleId === 1002) {
      return res.status(403).json({ 
        error: 'Forbidden: Cannot delete manager or admin users through this endpoint' 
      });
    }

    // Delete the user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deletedUser) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    // Log the successful deletion
    console.log(`User ${userId} deleted by ${req.user.username} (${req.user.id})`);

    return res.status(200).json({ 
      message: 'User deleted successfully',
      userId: deletedUser.id
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;