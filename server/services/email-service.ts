/**
 * Email Service
 * Manages email communications for user onboarding and password management
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Email template constants
const DEFAULT_SENDER = {
  email: "support@aditeke.com",
  name: "AdiTeke Software Solutions"
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
  temporaryPassword: string;
}): Promise<boolean> {
  const { email, name, username, temporaryPassword } = params;

  const subject = "Welcome to AdiTeke Software Solutions";
  const textContent = `
    Hello ${name},
    
    Welcome to AdiTeke Software Solutions! Your account has been created successfully.
    
    Your login details:
    Username: ${username}
    Temporary Password: ${temporaryPassword}
    
    For security reasons, you will be required to change your password when you first log in.
    
    Please visit our website to log in: https://www.aditeke.com/login
    
    If you have any questions, please don't hesitate to contact our support team.
    
    Best regards,
    AdiTeke Software Solutions Team
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4338CA; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to AdiTeke Software Solutions</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hello ${name},</p>
        
        <p>Welcome to AdiTeke Software Solutions! Your account has been created successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Your login details:</strong></p>
          <p style="margin: 5px 0;">Username: <strong>${username}</strong></p>
          <p style="margin: 5px 0;">Temporary Password: <strong>${temporaryPassword}</strong></p>
        </div>
        
        <p><strong>For security reasons, you will be required to change your password when you first log in.</strong></p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://www.aditeke.com/login" 
             style="background-color: #4338CA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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

  return await sendEmail(email, name, subject, htmlContent, textContent);
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
  const { email, name, username, resetLink, expiryTime } = params;

  const subject = "Password Reset - AdiTeke Software Solutions";
  const textContent = `
    Hello ${name},
    
    We received a request to reset your password for your AdiTeke Software Solutions account.
    
    Username: ${username}
    
    To reset your password, please click on the link below or copy and paste it into your browser:
    ${resetLink}
    
    This link will expire in ${expiryTime} hours.
    
    If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
    
    Best regards,
    AdiTeke Software Solutions Team
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4338CA; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hello ${name},</p>
        
        <p>We received a request to reset your password for your AdiTeke Software Solutions account.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;">Username: <strong>${username}</strong></p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4338CA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        
        <p style="font-size: 12px; color: #666;">
          Or copy and paste this URL into your browser:<br>
          <a href="${resetLink}" style="word-break: break-all;">${resetLink}</a>
        </p>
        
        <p><strong>This link will expire in ${expiryTime} hours.</strong></p>
        
        <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
        
        <p>Best regards,<br>AdiTeke Software Solutions Team</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; 2025 AdiTeke Software Solutions. All rights reserved.</p>
        <p>Portland, OR 97222 | <a href="mailto:support@aditeke.com">support@aditeke.com</a> | +1 (641) 481-8560</p>
      </div>
    </div>
  `;

  return await sendEmail(email, name, subject, htmlContent, textContent);
}

/**
 * Generic email sending function using Brevo API
 * @param email Recipient email
 * @param name Recipient name
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 * @param textContent Plain text content of the email
 * @returns True if the email was sent successfully
 */
async function sendEmail(
  email: string,
  name: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<boolean> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      console.error('BREVO_API_KEY is not set in the environment variables');
      return false;
    }
    
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: DEFAULT_SENDER,
        to: [{ email, name }],
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
    
    console.log(`Email sent successfully to ${email}, response status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error.response?.data || error.message);
    return false;
  }
}