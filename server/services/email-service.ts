/**
 * Email Service using Brevo (formerly Sendinblue)
 * Handles email delivery for user onboarding and password reset
 */

import * as SibApiV3Sdk from '@sendinblue/client';

// Configure API key authorization
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY;

// Set API key
const apiKeys = apiInstance.authentications['apiKey'];
apiKeys.apiKey = apiKey;

/**
 * Send a welcome email to a newly created user with temporary password
 */
export async function sendWelcomeEmail(options: {
  email: string;
  name: string;
  username: string;
  tempPassword: string;
  loginLink: string;
}) {
  const { email, name, username, tempPassword, loginLink } = options;
  
  const sender = {
    email: 'support@aditeke.com',
    name: 'AdiTeke Software Solutions'
  };
  
  const receivers = [
    {
      email: email,
      name: name || username
    }
  ];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://aditeke.com/logo.png" alt="AdiTeke Logo" style="max-width: 200px;">
      </div>
      <h1 style="color: #333; text-align: center;">Welcome to AdiTeke Software Solutions!</h1>
      <p>Hello ${name || username},</p>
      <p>Your account has been created successfully. Below are your temporary login credentials:</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>
      <p>For security reasons, you'll need to change your password when you first log in.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${loginLink}" style="background-color: #6366F1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Login Now
        </a>
      </div>
      <p>If you have any questions or need assistance, please contact our support team at support@aditeke.com.</p>
      <p>Best regards,<br>The AdiTeke Team</p>
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} AdiTeke Software Solutions. All rights reserved.</p>
      </div>
    </div>
  `;

  const sendEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendEmail.subject = "Welcome to AdiTeke Software Solutions";
  sendEmail.htmlContent = htmlContent;
  sendEmail.sender = sender;
  sendEmail.to = receivers;
  sendEmail.replyTo = sender;

  try {
    const response = await apiInstance.sendTransacEmail(sendEmail);
    console.log('Welcome email sent successfully:', response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send a password reset email with a secure reset link
 */
export async function sendPasswordResetEmail(options: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number; // in minutes
}) {
  const { email, name, username, resetLink, expiryTime } = options;
  
  const sender = {
    email: 'support@aditeke.com',
    name: 'AdiTeke Software Solutions'
  };
  
  const receivers = [
    {
      email: email,
      name: name || username
    }
  ];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://aditeke.com/logo.png" alt="AdiTeke Logo" style="max-width: 200px;">
      </div>
      <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
      <p>Hello ${name || username},</p>
      <p>We received a request to reset your password. Please click the button below to create a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #6366F1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p><strong>Important:</strong> This link will expire in ${expiryTime} minutes for security reasons.</p>
      <p>If you didn't request a password reset, please ignore this email or contact us at support@aditeke.com.</p>
      <p>Best regards,<br>The AdiTeke Team</p>
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} AdiTeke Software Solutions. All rights reserved.</p>
      </div>
    </div>
  `;

  const sendEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendEmail.subject = "Password Reset - AdiTeke Software Solutions";
  sendEmail.htmlContent = htmlContent;
  sendEmail.sender = sender;
  sendEmail.to = receivers;
  sendEmail.replyTo = sender;

  try {
    const response = await apiInstance.sendTransacEmail(sendEmail);
    console.log('Password reset email sent successfully:', response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}