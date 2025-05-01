// Email service wrapper that uses real service if available or falls back to console logging
import { ClientInvoice, User } from '../../shared/schema';
import * as EmailFallback from './emailFallback';

// Email attachment interface
interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

/**
 * Send an email using the real service if available, otherwise use fallback
 */
export async function sendEmail(params: {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}) {
  try {
    // Check if API key is available
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send email using real Brevo service...');
        return await emailService.sendEmail(params);
      } catch (error: any) {
        console.warn('Real email service failed, using fallback:', error.message);
        return await EmailFallback.logEmailToConsole(params);
      }
    } else {
      // Use fallback directly
      console.log('Using email fallback mode (real service not available)');
      return await EmailFallback.logEmailToConsole(params);
    }
  } catch (error: any) {
    console.error('Email wrapper error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Send an invoice email using the real service if available, otherwise use fallback
 */
export async function sendInvoicePdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send invoice email using real Brevo service...');
        return await emailService.sendInvoicePdfEmail(invoice, client, customSubject, customMessage, customEmail);
      } catch (error: any) {
        console.warn('Real invoice email service failed, using fallback:', error.message);
        return await EmailFallback.logInvoiceEmail(invoice, client, customSubject, customMessage, customEmail);
      }
    } else {
      // Use fallback directly
      console.log('Using invoice email fallback mode (real service not available)');
      return await EmailFallback.logInvoiceEmail(invoice, client, customSubject, customMessage, customEmail);
    }
  } catch (error: any) {
    console.error('Invoice email wrapper error:', error);
    throw new Error(`Invoice email sending failed: ${error.message}`);
  }
}

/**
 * Send a receipt email using the real service if available, otherwise use fallback
 */
export async function sendReceiptPdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send receipt email using real Brevo service...');
        return await emailService.sendReceiptPdfEmail(invoice, client, customSubject, customMessage, customEmail);
      } catch (error: any) {
        console.warn('Real receipt email service failed, using fallback:', error.message);
        return await EmailFallback.logReceiptEmail(invoice, client, customSubject, customMessage, customEmail);
      }
    } else {
      // Use fallback directly
      console.log('Using receipt email fallback mode (real service not available)');
      return await EmailFallback.logReceiptEmail(invoice, client, customSubject, customMessage, customEmail);
    }
  } catch (error: any) {
    console.error('Receipt email wrapper error:', error);
    throw new Error(`Receipt email sending failed: ${error.message}`);
  }
}

/**
 * Send a welcome email with consistent fallback capability
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
}): Promise<{ success: boolean }> {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import real service
        const emailService = await import('./emailService');
        
        // Create HTML and text content for the email
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0040A1; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to AdiTeke Software Solutions</h1>
            </div>
            
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              <p>Hello ${params.name},</p>
              
              <p>Welcome to AdiTeke Software Solutions! Your account has been created successfully.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Your login details:</strong></p>
                <p style="margin: 5px 0;">Username: <strong>${params.username}</strong></p>
                <p style="margin: 5px 0;">Temporary Password: <strong>${params.temporaryPassword}</strong></p>
              </div>
              
              <p><strong>For security reasons, you will be required to change your password when you first log in.</strong></p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://www.aditeke.com/login" 
                   style="background-color: #0040A1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Log In Now
                </a>
              </p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>AdiTeke Software Solutions Team</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>&copy; 2025 AdiTeke Software Solutions. All rights reserved.</p>
              <p>Portland, OR 97222 | <a href="mailto:support@aditeke.com">support@aditeke.com</a> | +1 (641) 481-8560</p>
            </div>
          </div>
        `;
        
        const textContent = `
          Hello ${params.name},
          
          Welcome to AdiTeke Software Solutions! Your account has been created successfully.
          
          Your login details:
          Username: ${params.username}
          Temporary Password: ${params.temporaryPassword}
          
          For security reasons, you will be required to change your password when you first log in.
          
          Please visit our website to log in: https://www.aditeke.com/login
          
          If you have any questions, please don't hesitate to contact our support team.
          
          Best regards,
          AdiTeke Software Solutions Team
        `;
        
        // Try with real service
        console.log('Attempting to send welcome email using real Brevo service...');
        return await emailService.sendEmail({
          to: params.email,
          from: 'mule2069@gmail.com', // Using verified sender
          subject: "Welcome to AdiTeke Software Solutions",
          html: htmlContent,
          text: textContent
        });
      } catch (error: any) {
        console.warn('Real welcome email service failed, using fallback:', error.message);
        return await EmailFallback.logWelcomeEmail(params);
      }
    } else {
      // Use fallback directly
      console.log('Using welcome email fallback mode (real service not available)');
      return await EmailFallback.logWelcomeEmail(params);
    }
  } catch (error: any) {
    console.error('Welcome email wrapper error:', error);
    throw new Error(`Welcome email sending failed: ${error.message}`);
  }
}

/**
 * Send a password reset email with consistent fallback capability
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}): Promise<{ success: boolean }> {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import real service
        const emailService = await import('./emailService');
        
        // Create HTML and text content for the email
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0040A1; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              <p>Hello ${params.name},</p>
              
              <p>We received a request to reset your password for your AdiTeke Software Solutions account.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;">Username: <strong>${params.username}</strong></p>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${params.resetLink}" 
                   style="background-color: #0040A1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Reset Password
                </a>
              </p>
              
              <p style="font-size: 12px; color: #666;">
                Or copy and paste this URL into your browser:<br>
                <a href="${params.resetLink}" style="word-break: break-all;">${params.resetLink}</a>
              </p>
              
              <p><strong>This link will expire in ${params.expiryTime} hours.</strong></p>
              
              <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
              
              <p>Best regards,<br>AdiTeke Software Solutions Team</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>&copy; 2025 AdiTeke Software Solutions. All rights reserved.</p>
              <p>Portland, OR 97222 | <a href="mailto:support@aditeke.com">support@aditeke.com</a> | +1 (641) 481-8560</p>
            </div>
          </div>
        `;
        
        const textContent = `
          Hello ${params.name},
          
          We received a request to reset your password for your AdiTeke Software Solutions account.
          
          Username: ${params.username}
          
          To reset your password, please click on the link below or copy and paste it into your browser:
          ${params.resetLink}
          
          This link will expire in ${params.expiryTime} hours.
          
          If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
          
          Best regards,
          AdiTeke Software Solutions Team
        `;
        
        // Try with real service
        console.log('Attempting to send password reset email using real Brevo service...');
        return await emailService.sendEmail({
          to: params.email,
          from: 'mule2069@gmail.com', // Using verified sender
          subject: "Password Reset - AdiTeke Software Solutions",
          html: htmlContent,
          text: textContent
        });
      } catch (error: any) {
        console.warn('Real password reset email service failed, using fallback:', error.message);
        return await EmailFallback.logPasswordResetEmail(params);
      }
    } else {
      // Use fallback directly
      console.log('Using password reset email fallback mode (real service not available)');
      return await EmailFallback.logPasswordResetEmail(params);
    }
  } catch (error: any) {
    console.error('Password reset email wrapper error:', error);
    throw new Error(`Password reset email sending failed: ${error.message}`);
  }
}