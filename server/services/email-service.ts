/**
 * Email Service
 * Manages email communications for user onboarding and password management
 */

import axios from 'axios';

// Set API key for authentication
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.warn('BREVO_API_KEY environment variable is not set! Email functionality will not work.');
}

// Default sender information
const DEFAULT_SENDER = {
  email: 'support@aditeke.com',
  name: 'AdiTeke Software Solutions'
};

// Company information for email templates
const COMPANY_INFO = {
  name: 'AdiTeke Software Solutions',
  address: 'Portland, OR 97222',
  phone: '+1 (641) 481-8560',
  website: 'https://aditeke.com'
};

/**
 * Send a welcome email to a new user with their temporary password
 * @param params Email parameters including recipient info and temporary password
 * @returns True if email was sent successfully
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  tempPassword: string;
  loginLink: string;
}): Promise<boolean> {
  console.log(`Sending welcome email to ${params.email}...`);
  
  if (!apiKey) {
    console.error('Cannot send email: BREVO_API_KEY is not set');
    return false;
  }
  
  try {
    // Create welcome email template
    const subject = 'Welcome to AdiTeke Software Solutions';
    
    // HTML email body with temporary password
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="background-color: #6366F1; padding: 20px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to AdiTeke Software Solutions</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${params.name},</p>
          
          <p>Welcome to AdiTeke Software Solutions! Your account has been created and you can now access your personal dashboard.</p>
          
          <p><strong>Your login credentials:</strong></p>
          <ul>
            <li><strong>Username:</strong> ${params.username}</li>
            <li><strong>Temporary Password:</strong> ${params.tempPassword}</li>
          </ul>
          
          <p>For security reasons, you'll be required to change your password when you first log in.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.loginLink}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team at support@aditeke.com or call us at +1 (641) 481-8560.</p>
          
          <p>Thank you for choosing AdiTeke Software Solutions!</p>
          
          <p>Best regards,<br>The AdiTeke Team</p>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
          <p>${COMPANY_INFO.name} | ${COMPANY_INFO.address} | ${COMPANY_INFO.phone}</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    // Plain text version for email clients that don't support HTML
    const textContent = `
Welcome to AdiTeke Software Solutions!

Hello ${params.name},

Welcome to AdiTeke Software Solutions! Your account has been created and you can now access your personal dashboard.

Your login credentials:
- Username: ${params.username}
- Temporary Password: ${params.tempPassword}

For security reasons, you'll be required to change your password when you first log in.

Login to your account at: ${params.loginLink}

If you have any questions or need assistance, please contact our support team at support@aditeke.com or call us at +1 (641) 481-8560.

Thank you for choosing AdiTeke Software Solutions!

Best regards,
The AdiTeke Team

${COMPANY_INFO.name} | ${COMPANY_INFO.address} | ${COMPANY_INFO.phone}
This is an automated message. Please do not reply to this email.
    `;

    // Send the email using Brevo API v3 directly
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: DEFAULT_SENDER,
        to: [{ email: params.email, name: params.name }],
        subject,
        htmlContent,
        textContent
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey
        }
      }
    );
    
    console.log(`Welcome email sent to ${params.email} - Response status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.error('Error sending welcome email:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Send a password reset email with a reset link
 * @param params Email parameters including recipient info and reset link
 * @returns True if email was sent successfully
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}): Promise<boolean> {
  console.log(`Sending password reset email to ${params.email}...`);
  
  if (!apiKey) {
    console.error('Cannot send email: BREVO_API_KEY is not set');
    return false;
  }
  
  try {
    // Create password reset email template
    const subject = 'Password Reset Request - AdiTeke Software Solutions';
    
    // HTML email body with reset link
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="background-color: #6366F1; padding: 20px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${params.name},</p>
          
          <p>We received a request to reset the password for your account (username: <strong>${params.username}</strong>). If you did not make this request, you can ignore this email.</p>
          
          <p>To reset your password, click the button below. This link will expire in ${params.expiryTime} hours.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.resetLink}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
          </div>
          
          <p>If the button above does not work, copy and paste the following URL into your browser:</p>
          <p style="word-break: break-all; background-color: #f7f7f7; padding: 10px; border-radius: 4px;">${params.resetLink}</p>
          
          <p>If you did not request a password reset, please contact our support team immediately at support@aditeke.com or call us at +1 (641) 481-8560.</p>
          
          <p>Best regards,<br>The AdiTeke Team</p>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
          <p>${COMPANY_INFO.name} | ${COMPANY_INFO.address} | ${COMPANY_INFO.phone}</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    // Plain text version for email clients that don't support HTML
    const textContent = `
Password Reset Request - AdiTeke Software Solutions

Hello ${params.name},

We received a request to reset the password for your account (username: ${params.username}). If you did not make this request, you can ignore this email.

To reset your password, please visit the following link (expires in ${params.expiryTime} hours):
${params.resetLink}

If you did not request a password reset, please contact our support team immediately at support@aditeke.com or call us at +1 (641) 481-8560.

Best regards,
The AdiTeke Team

${COMPANY_INFO.name} | ${COMPANY_INFO.address} | ${COMPANY_INFO.phone}
This is an automated message. Please do not reply to this email.
    `;

    // Send the email using Brevo API v3 directly
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: DEFAULT_SENDER,
        to: [{ email: params.email, name: params.name }],
        subject,
        htmlContent,
        textContent
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey
        }
      }
    );
    
    console.log(`Password reset email sent to ${params.email} - Response status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error.response?.data || error.message);
    return false;
  }
}