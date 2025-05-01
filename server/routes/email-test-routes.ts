/**
 * Test routes for email functionality
 * For development use only
 */

import { Router } from "express";
import { sendWelcomeEmail as sendNodemailerWelcomeEmail } from '../utils/nodemailerService';
import { sendWelcomeEmail as sendBrevoWelcomeEmail } from '../services/email-service';

// Create a router instance
const router = Router();

/**
 * Test endpoint for sending a welcome email with Nodemailer
 * Only accessible in development mode
 */
router.post('/test/email/nodemailer', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found in production' });
  }
  
  try {
    // Extract test data from request
    const { email, name, username } = req.body;
    
    // Validate test data
    if (!email || !name || !username) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: {
          email: 'The recipient email address',
          name: 'The recipient name',
          username: 'The recipient username'
        }
      });
    }
    
    // Generate a temporary password for testing
    const temporaryPassword = 'Test1234!';
    
    console.log(`Sending test welcome email to ${email} via Nodemailer...`);
    
    // Send the test email
    const result = await sendNodemailerWelcomeEmail({
      email,
      name,
      username,
      temporaryPassword
    });
    
    return res.status(200).json({
      success: true,
      method: 'nodemailer',
      message: `Test welcome email sent to ${email}`,
      result
    });
  } catch (error) {
    console.error('Error sending test welcome email via Nodemailer:', error);
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message || String(error)
    });
  }
});

/**
 * Test endpoint for sending a welcome email with Brevo
 * Only accessible in development mode
 */
router.post('/test/email/brevo', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found in production' });
  }
  
  try {
    // Extract test data from request
    const { email, name, username } = req.body;
    
    // Validate test data
    if (!email || !name || !username) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: {
          email: 'The recipient email address',
          name: 'The recipient name',
          username: 'The recipient username'
        }
      });
    }
    
    // Generate a temporary password for testing
    const temporaryPassword = 'Test1234!';
    
    console.log(`Sending test welcome email to ${email} via Brevo...`);
    
    // Check if Brevo API key is set
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({
        error: 'BREVO_API_KEY not set in environment variables'
      });
    }
    
    // Send the test email
    const result = await sendBrevoWelcomeEmail({
      email,
      name,
      username,
      temporaryPassword
    });
    
    return res.status(200).json({
      success: true,
      method: 'brevo',
      message: `Test welcome email sent to ${email}`,
      result
    });
  } catch (error) {
    console.error('Error sending test welcome email via Brevo:', error);
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message || String(error)
    });
  }
});

export default router;