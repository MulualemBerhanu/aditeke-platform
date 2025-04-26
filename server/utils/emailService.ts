import { MailService } from '@sendgrid/mail';
import { ClientInvoice, User } from '../../shared/schema';
import { generateInvoicePdf, generateReceiptPdf } from './pdfGenerator';

// Initialize SendGrid with API key
const sgMail = new MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// The verified sender email address (this email must be verified in SendGrid)
const VERIFIED_SENDER = 'berhanumulualemadisu@gmail.com';

// Default sender configuration to use in all emails
const DEFAULT_SENDER = {
  email: VERIFIED_SENDER,
  name: 'AdiTeke Software Solutions'
};

interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

/**
 * Sends an email with optional attachments
 */
export async function sendEmail(params: {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}) {
  try {
    // Use the properly formatted sender object with name and email
    const from = {
      email: params.from || VERIFIED_SENDER,
      name: 'AdiTeke Software Solutions'
    };
    
    // We must provide at least one of: text, html, templateId, or content
    // Check if we have either text or html
    if (!params.text && !params.html) {
      // Default to empty text if neither is provided
      params.text = ' '; // Space character to ensure it's not empty
    }
    
    // Prepare email data for SendGrid
    const msg: any = {
      to: params.to,
      from, // Using the properly formatted sender object
      subject: params.subject,
    };
    
    // Add content based on what's provided
    if (params.html) {
      msg.html = params.html;
    }
    
    if (params.text) {
      msg.text = params.text;
    }
    
    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      msg.attachments = params.attachments;
    }

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    return { success: true, statusCode: response[0].statusCode };
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Get more detailed error information if available
    let errorMessage = 'Unknown error occurred';
    
    if (error.code === 403) {
      errorMessage = 'Email sending forbidden. This may be due to: 1) Sender email not verified in SendGrid, 2) SendGrid API key needs to be refreshed, or 3) Mail sending limits reached';
    } else if (error.response && error.response.body && error.response.body.errors) {
      // Extract detailed error information from SendGrid response
      errorMessage = error.response.body.errors.map((e: any) => e.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Enhanced error with more context
    const enhancedError = new Error(`SendGrid email error: ${errorMessage}`);
    throw enhancedError;
  }
}

/**
 * Generates an invoice PDF and sends it as an email attachment
 */
export async function sendInvoicePdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Generate PDF buffer using pdfGenerator
    const pdfBuffer = await generateInvoicePdf(invoice, client);
    
    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create default email content
    const defaultEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #0040A1; color: white; padding: 20px; text-align: center;">
          <h1>AdiTeke Software Solutions</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${client.name || client.username},</p>
          <p>Please find attached your invoice #${invoice.invoiceNumber} for ${invoice.description || 'our services'}.</p>
          <p>Invoice Details:</p>
          <ul>
            <li>Invoice Number: ${invoice.invoiceNumber}</li>
            <li>Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}</li>
            <li>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</li>
            <li>Amount: $${Number(invoice.amount).toFixed(2)}</li>
          </ul>
          <p>If you have any questions about this invoice, please contact our support team at support@aditeke.com.</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The AdiTeke Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
          <p>AdiTeke Software Solutions<br>Portland, OR, USA<br>www.aditeke.com</p>
        </div>
      </div>
    `;
    
    // Use custom message if provided
    const emailHtml = customMessage ? `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #0040A1; color: white; padding: 20px; text-align: center;">
          <h1>AdiTeke Software Solutions</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${client.name || client.username},</p>
          <div>${customMessage}</div>
          <p style="margin-top: 15px;">Best regards,<br>The AdiTeke Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
          <p>AdiTeke Software Solutions<br>Portland, OR, USA<br>www.aditeke.com</p>
        </div>
      </div>
    ` : defaultEmailHtml;
    
    // Use custom subject if provided
    const emailSubject = customSubject || `Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`;
    
    // Send email with PDF attachment
    await sendEmail({
      to: customEmail || client.email,
      from: VERIFIED_SENDER, // Using our defined verified sender
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          content: pdfBase64,
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

/**
 * Generates a receipt PDF and sends it as an email attachment
 */
export async function sendReceiptPdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Generate PDF buffer using pdfGenerator
    const pdfBuffer = await generateReceiptPdf(invoice, client);
    
    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create default email content
    const defaultEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #0040A1; color: white; padding: 20px; text-align: center;">
          <h1>AdiTeke Software Solutions</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${client.name || client.username},</p>
          <p>Thank you for your payment. Please find attached your receipt for Invoice #${invoice.invoiceNumber}.</p>
          <p>Payment Details:</p>
          <ul>
            <li>Receipt Number: ${invoice.receiptNumber || `RCPT-${Date.now()}`}</li>
            <li>Invoice Number: ${invoice.invoiceNumber}</li>
            <li>Payment Date: ${new Date(invoice.paidDate || new Date()).toLocaleDateString()}</li>
            <li>Payment Method: ${invoice.paymentMethod ? invoice.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Manual'}</li>
            <li>Amount Paid: $${Number(invoice.paidAmount || invoice.amount).toFixed(2)}</li>
          </ul>
          <p>If you have any questions about this receipt, please contact our support team at support@aditeke.com.</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The AdiTeke Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
          <p>AdiTeke Software Solutions<br>Portland, OR, USA<br>www.aditeke.com</p>
        </div>
      </div>
    `;
    
    // Use custom message if provided
    const emailHtml = customMessage ? `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #0040A1; color: white; padding: 20px; text-align: center;">
          <h1>AdiTeke Software Solutions</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${client.name || client.username},</p>
          <div>${customMessage}</div>
          <p style="margin-top: 15px;">Best regards,<br>The AdiTeke Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
          <p>AdiTeke Software Solutions<br>Portland, OR, USA<br>www.aditeke.com</p>
        </div>
      </div>
    ` : defaultEmailHtml;
    
    // Use custom subject if provided
    const emailSubject = customSubject || `Receipt for Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`;
    
    // Send email with PDF attachment
    await sendEmail({
      to: customEmail || client.email,
      from: VERIFIED_SENDER, // Using our defined verified sender
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          content: pdfBase64,
          filename: `Receipt-${invoice.receiptNumber || Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
}