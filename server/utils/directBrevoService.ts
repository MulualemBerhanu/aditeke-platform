/**
 * Direct Brevo implementation for welcome and reset emails
 * This bypasses the IP restriction issue by using the same direct fetch approach as invoices
 */

// The verified sender email address (registered with Brevo)
const VERIFIED_SENDER = 'mule2069@gmail.com';

/**
 * Template data interface for custom emails
 */
interface TemplateData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Send an email directly using Brevo API V3
 */
export async function sendDirectBrevoEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  senderName?: string;
}) {
  try {
    // Verify API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error('Brevo API key not configured');
    }

    // Use the provided sender name or default to Notifications
    const senderName = params.senderName || 'AdiTeke Notifications';

    // Format the sender with name
    const sender = {
      email: VERIFIED_SENDER,
      name: senderName
    };

    // Prepare API request payload
    const payload = {
      sender,
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
      headers: {
        'X-Mailer': 'AdiTeke-Mailer/1.0',
        'X-Entity-Ref-ID': `aditeke-${Date.now()}`
      }
    };

    console.log('Sending direct Brevo email to:', params.to);
    console.log('Using Brevo API key prefix:', brevoApiKey.substring(0, 5) + '...');

    // Make direct fetch request to Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Brevo API error: ${response.status} ${errorText}`);
      }
      throw new Error(`Brevo API error: ${errorJson.message || errorJson.error || JSON.stringify(errorJson)}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via direct Brevo API:', result);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Error sending direct Brevo email:', error);
    throw error;
  }
}

/**
 * Send a welcome email using direct Brevo API
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
}) {
  try {
    const { email, name, username, temporaryPassword } = params;

    console.log(`Preparing welcome email for ${username} (${email}) using direct Brevo API`);

    const subject = "Welcome to AdiTeke Software Solutions";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0040A1; padding: 20px; text-align: center;">
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

    // Plain text version
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

    // Send using direct Brevo API
    return await sendDirectBrevoEmail({
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
      senderName: 'AdiTeke Welcome'
    });
  } catch (error) {
    console.error('Error sending welcome email via direct Brevo:', error);
    throw error;
  }
}

/**
 * Send a password reset email using direct Brevo API
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}) {
  try {
    const { email, name, username, resetLink, expiryTime } = params;

    console.log(`Preparing password reset email for ${username} (${email}) using direct Brevo API`);

    const subject = "Password Reset - AdiTeke Software Solutions";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0040A1; padding: 20px; text-align: center;">
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
               style="background-color: #0040A1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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

    // Plain text version
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

    // Send using direct Brevo API
    return await sendDirectBrevoEmail({
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
      senderName: 'AdiTeke Security'
    });
  } catch (error) {
    console.error('Error sending password reset email via direct Brevo:', error);
    throw error;
  }
}

/**
 * Send a custom notification or templated email using direct Brevo API
 */
export async function sendCustomEmail(params: {
  to: string;
  subject: string;
  templateData: TemplateData;
  text?: string;
  html?: string;
  senderName?: string;
}) {
  try {
    const { to, subject, templateData, text, html, senderName } = params;

    console.log(`Preparing custom email to ${to} with subject: ${subject}`);

    // If HTML content is provided directly, use it
    if (html) {
      return await sendDirectBrevoEmail({
        to,
        subject,
        html,
        text,
        senderName: senderName || 'AdiTeke Notifications'
      });
    }

    // Otherwise generate a standard notification template
    const firstName = templateData.firstName || 'User';
    const timestamp = templateData.timestamp || new Date().toLocaleString();
    const projectName = templateData.projectName || 'Your project';
    const updateType = templateData.updateType || 'Update';
    const updateDetails = templateData.updateDetails || 'There has been an update to your project.';
    const actionRequired = templateData.actionRequired || '';
    const loginLink = templateData.loginLink || 'https://www.aditeke.com/login';

    // Generate HTML from template data
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0040A1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Project Update Notification</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Hello ${firstName},</p>
          
          <p>We're reaching out to inform you about an update to your project with AdiTeke Software Solutions.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Project:</strong> ${projectName}</p>
            <p style="margin: 5px 0;"><strong>Update Type:</strong> ${updateType}</p>
            <p style="margin: 5px 0;"><strong>Details:</strong> ${updateDetails}</p>
            ${actionRequired ? `<p style="margin: 5px 0;"><strong>Action Required:</strong> ${actionRequired}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${timestamp}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background-color: #0040A1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Project Details
            </a>
          </p>
          
          <p>If you have any questions about this update, please contact your project manager directly.</p>
          
          <p>Best regards,<br>AdiTeke Software Solutions Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; 2025 AdiTeke Software Solutions. All rights reserved.</p>
          <p>Portland, OR 97222 | <a href="mailto:support@aditeke.com">support@aditeke.com</a> | +1 (641) 481-8560</p>
        </div>
      </div>
    `;

    // Generate plain text version for email clients that don't support HTML
    const generatedTextContent = `
      Hello ${firstName},
      
      We're reaching out to inform you about an update to your project with AdiTeke Software Solutions.
      
      Project: ${projectName}
      Update Type: ${updateType}
      Details: ${updateDetails}
      ${actionRequired ? `Action Required: ${actionRequired}` : ''}
      Timestamp: ${timestamp}
      
      To view your project details, please visit: ${loginLink}
      
      If you have any questions about this update, please contact your project manager directly.
      
      Best regards,
      AdiTeke Software Solutions Team
    `;

    // Send using direct Brevo API
    return await sendDirectBrevoEmail({
      to,
      subject,
      html: htmlContent,
      text: text || generatedTextContent,
      senderName: senderName || 'AdiTeke Project Updates'
    });
  } catch (error) {
    console.error('Error sending custom email via direct Brevo:', error);
    throw error;
  }
}

/**
 * Send a verification email using direct Brevo API
 */
export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  username: string;
  verificationLink: string;
  expiryTime?: number; // in hours
}) {
  try {
    const { email, name, username, verificationLink, expiryTime = 48 } = params;

    console.log(`Preparing verification email for ${username} (${email}) using direct Brevo API`);

    const subject = "Verify Your Email - AdiTeke Software Solutions";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0040A1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Hello ${name},</p>
          
          <p>Thank you for registering with AdiTeke Software Solutions. To complete your registration, we need to verify your email address.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;">Username: <strong>${username}</strong></p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #0040A1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify My Email
            </a>
          </p>
          
          <p style="font-size: 12px; color: #666;">
            Or copy and paste this URL into your browser:<br>
            <a href="${verificationLink}" style="word-break: break-all;">${verificationLink}</a>
          </p>
          
          <p><strong>This link will expire in ${expiryTime} hours.</strong></p>
          
          <p>If you did not request this verification, please ignore this email or contact our support team if you have concerns.</p>
          
          <p>Best regards,<br>AdiTeke Software Solutions Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; 2025 AdiTeke Software Solutions. All rights reserved.</p>
          <p>Portland, OR 97222 | <a href="mailto:support@aditeke.com">support@aditeke.com</a> | +1 (641) 481-8560</p>
        </div>
      </div>
    `;

    // Plain text version
    const textContent = `
      Hello ${name},
      
      Thank you for registering with AdiTeke Software Solutions. To complete your registration, we need to verify your email address.
      
      Username: ${username}
      
      To verify your email address, please click on the link below or copy and paste it into your browser:
      ${verificationLink}
      
      This link will expire in ${expiryTime} hours.
      
      If you did not request this verification, please ignore this email or contact our support team if you have concerns.
      
      Best regards,
      AdiTeke Software Solutions Team
    `;

    // Send using direct Brevo API
    return await sendDirectBrevoEmail({
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
      senderName: 'AdiTeke Verification'
    });
  } catch (error) {
    console.error('Error sending verification email via direct Brevo:', error);
    throw error;
  }
}