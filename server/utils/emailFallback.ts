import { ClientInvoice, User } from '../../shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { generateInvoicePdf, generateReceiptPdf } from './pdfGenerator';

// For development and testing when email service is unavailable
export async function logEmailToConsole(params: {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}) {
  console.log('=============== EMAIL FALLBACK MODE ===============');
  console.log(`TO: ${params.to}`);
  console.log(`FROM: ${params.from || 'berhanumulualemadisu@gmail.com'}`);
  console.log(`SUBJECT: ${params.subject}`);
  
  if (params.text) {
    console.log('\n--- TEXT CONTENT ---');
    console.log(params.text);
  }
  
  if (params.html) {
    console.log('\n--- HTML CONTENT (Summary) ---');
    console.log(params.html.substring(0, 150) + '...');
  }
  
  if (params.attachments && params.attachments.length > 0) {
    console.log('\n--- ATTACHMENTS ---');
    params.attachments.forEach(attachment => {
      console.log(`- ${attachment.filename} (${attachment.type}) [Content length: ${attachment.content.length} chars]`);
    });
  }
  
  console.log('===============================================');
  return { success: true, messageId: `fallback-${Date.now()}` };
}

/**
 * Generates an invoice PDF and logs it as an email (fallback mode)
 */
export async function logInvoiceEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Generate PDF buffer using pdfGenerator
    const pdfBuffer = await generateInvoicePdf(invoice, client);
    
    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create default email content
    const defaultEmailHtml = `
      <div>
        <h1>AdiTeke Software Solutions</h1>
        <p>Dear ${client.name || client.username},</p>
        <p>Please find attached your invoice #${invoice.invoiceNumber}.</p>
        <p>Best regards,<br>The AdiTeke Team</p>
      </div>
    `;
    
    // Use custom message if provided
    const emailHtml = customMessage ? `
      <div>
        <h1>AdiTeke Software Solutions</h1>
        <p>Dear ${client.name || client.username},</p>
        <div>${customMessage}</div>
        <p>Best regards,<br>The AdiTeke Team</p>
      </div>
    ` : defaultEmailHtml;
    
    // Use custom subject if provided
    const emailSubject = customSubject || `Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`;
    
    // Log email with PDF attachment
    await logEmailToConsole({
      to: customEmail || client.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          content: pdfBase64.substring(0, 100) + '...[PDF CONTENT TRUNCATED]',
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email (fallback mode):', error);
    throw error;
  }
}

/**
 * Generates a receipt PDF and logs it as an email (fallback mode)
 */
export async function logReceiptEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Generate PDF buffer using pdfGenerator
    const pdfBuffer = await generateReceiptPdf(invoice, client);
    
    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create default email content
    const defaultEmailHtml = `
      <div>
        <h1>AdiTeke Software Solutions</h1>
        <p>Dear ${client.name || client.username},</p>
        <p>Thank you for your payment. Please find attached your receipt for Invoice #${invoice.invoiceNumber}.</p>
        <p>Best regards,<br>The AdiTeke Team</p>
      </div>
    `;
    
    // Use custom message if provided
    const emailHtml = customMessage ? `
      <div>
        <h1>AdiTeke Software Solutions</h1>
        <p>Dear ${client.name || client.username},</p>
        <div>${customMessage}</div>
        <p>Best regards,<br>The AdiTeke Team</p>
      </div>
    ` : defaultEmailHtml;
    
    // Use custom subject if provided
    const emailSubject = customSubject || `Receipt for Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`;
    
    // Log email with PDF attachment
    await logEmailToConsole({
      to: customEmail || client.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          content: pdfBase64.substring(0, 100) + '...[PDF CONTENT TRUNCATED]',
          filename: `Receipt-${invoice.receiptNumber || Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending receipt email (fallback mode):', error);
    throw error;
  }
}

/**
 * Logs welcome email content to console (fallback mode)
 */
export async function logWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
}): Promise<{ success: boolean }> {
  try {
    const { email, name, username, temporaryPassword } = params;
    
    // Create welcome email content
    const emailHtml = `
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
    
    const subject = "Welcome to AdiTeke Software Solutions";
    
    // Log welcome email to console
    await logEmailToConsole({
      to: email,
      subject: subject,
      html: emailHtml,
      text: textContent
    });
    
    console.log('WELCOME EMAIL FALLBACK: Successfully logged welcome email for', email);
    return { success: true };
  } catch (error) {
    console.error('Error logging welcome email (fallback mode):', error);
    throw error;
  }
}

/**
 * Logs password reset email content to console (fallback mode)
 */
export async function logPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}): Promise<{ success: boolean }> {
  try {
    const { email, name, username, resetLink, expiryTime } = params;
    
    // Create password reset email content
    const emailHtml = `
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
    
    const subject = "Password Reset - AdiTeke Software Solutions";
    
    // Log password reset email to console
    await logEmailToConsole({
      to: email,
      subject: subject,
      html: emailHtml,
      text: textContent
    });
    
    console.log('PASSWORD RESET EMAIL FALLBACK: Successfully logged password reset email for', email);
    return { success: true };
  } catch (error) {
    console.error('Error logging password reset email (fallback mode):', error);
    throw error;
  }
}