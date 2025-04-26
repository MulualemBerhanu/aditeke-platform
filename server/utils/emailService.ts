import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ClientInvoice, User } from '../../shared/schema';
import { generateInvoicePdf, generateReceiptPdf } from './pdfGenerator';

// Initialize the Brevo SDK API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

// Set Brevo API key
if (!process.env.BREVO_API_KEY) {
  console.warn('BREVO_API_KEY environment variable is not set. Email functionality will be disabled.');
} else {
  apiKey.apiKey = process.env.BREVO_API_KEY;
  console.log('Brevo API initialized successfully');
}

// The verified sender email address
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
 * Sends an email with optional attachments using Brevo
 */
export async function sendEmail(params: {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}) {
  try {
    // If Brevo API key is not set, log warning and return
    if (!process.env.BREVO_API_KEY) {
      console.warn('Email sending skipped: BREVO_API_KEY not set');
      throw new Error('Brevo API key is not configured');
    }

    // Format the sender with name
    const sender = {
      email: params.from || VERIFIED_SENDER,
      name: 'AdiTeke Software Solutions'
    };
    
    // Initialize Brevo API client
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Create a new email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    // Set email parameters
    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{ email: params.to }];
    
    // Add HTML content if available
    if (params.html) {
      sendSmtpEmail.htmlContent = params.html;
    }
    
    // Add text content if available
    if (params.text) {
      sendSmtpEmail.textContent = params.text;
    }
    
    // If neither text nor HTML is provided, add a space to the text content
    if (!params.html && !params.text) {
      sendSmtpEmail.textContent = ' ';
    }
    
    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      sendSmtpEmail.attachment = params.attachments.map(attachment => ({
        content: attachment.content,
        name: attachment.filename
      }));
    }
    
    // Send the email
    console.log('Attempting to send email via Brevo to:', params.to);
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo:', response);
    return { success: true, messageId: response.messageId };
  } catch (error: any) {
    console.error('Error sending email with Brevo:', error);
    
    // Get more detailed error information if available
    let errorMessage = 'Unknown error occurred';
    
    if (error.response && error.response.text) {
      try {
        // Parse the error response if it's JSON
        const errorBody = JSON.parse(error.response.text);
        errorMessage = errorBody.message || errorBody.error || String(error);
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = error.response.text;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Enhanced error with more context
    const enhancedError = new Error(`Brevo email error: ${errorMessage}`);
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