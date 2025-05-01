import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize the transporter when first needed
function getNodemailerTransporter() {
  if (!transporter) {
    // Check if Gmail app password is set (better for production)
    if (process.env.GMAIL_APP_PASSWORD) {
      // Create a secure connection using Gmail app password
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mule2069@gmail.com', // Your verified Gmail 
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    } else {
      // Create a development test account with Ethereal if no Gmail password
      console.log('Creating test email account for development...');
      
      // For development only - create test SMTP credentials automatically
      nodemailer.createTestAccount().then(testAccount => {
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // use TLS
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        console.log('Created test email account:', testAccount.user);
      }).catch(err => {
        console.error('Failed to create test email account:', err);
      });
    }
  }
  
  return transporter;
}

/**
 * Send an email using nodemailer (more reliable and IP-agnostic)
 */
export async function sendNodemailerEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    // Ensure we have a transporter
    const emailTransporter = getNodemailerTransporter();
    
    if (!emailTransporter) {
      throw new Error('Email transporter not initialized');
    }
    
    // Set up the message
    const mailOptions = {
      from: '"AdiTeke Software Solutions" <mule2069@gmail.com>',
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    };
    
    console.log(`[Nodemailer] Sending email to ${params.to}...`);
    
    // Send the email
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Log output varies based on production vs test account
    if (info.messageId) {
      console.log(`[Nodemailer] Email sent: ${info.messageId}`);
      
      // If using Ethereal, provide the preview URL
      if (info.messageId.includes('ethereal')) {
        console.log(`[Nodemailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[Nodemailer] Error sending email:', error);
    
    // Provide detailed error for easier debugging
    const errorMessage = error.message || 'Unknown email error';
    throw new Error(`Nodemailer error: ${errorMessage}`);
  }
}

/**
 * Send a welcome email to a new user with their temporary password
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
}): Promise<boolean> {
  try {
    const { email, name, username, temporaryPassword } = params;
    
    console.log(`[Nodemailer] Preparing welcome email for ${username} (${email})`);
    
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
    
    // Send the email using nodemailer
    await sendNodemailerEmail({
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    return true;
  } catch (error) {
    console.error('[Nodemailer] Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send a password reset email with a reset link
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}): Promise<boolean> {
  try {
    const { email, name, username, resetLink, expiryTime } = params;
    
    console.log(`[Nodemailer] Preparing password reset email for ${username} (${email})`);
    
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
    
    // Send the email using nodemailer
    await sendNodemailerEmail({
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    return true;
  } catch (error) {
    console.error('[Nodemailer] Error sending password reset email:', error);
    return false;
  }
}