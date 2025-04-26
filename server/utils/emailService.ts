import { ClientInvoice, User } from '../../shared/schema';
import { generateInvoicePdf, generateReceiptPdf } from './pdfGenerator';

// The verified sender email addresses
const NOTIFICATION_SENDER = 'noreply@aditeke.com';
const SUPPORT_SENDER = 'support@aditeke.com';
const INVOICE_SENDER = 'billing@aditeke.com';

// Define our own interface for email attachments
interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

/**
 * Get a plain text version from HTML content
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Direct implementation of the Brevo API v3 for sending emails
 * This avoids using the SDK which has compatibility issues
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
    // Force reload environment variable 
    // (In some runtime environments, environment variables loaded via secrets might need this)
    const brevoApiKey = process.env.BREVO_API_KEY;
    
    console.log('Checking for Brevo API key...');
    console.log('BREVO_API_KEY is', brevoApiKey ? 'set' : 'not set');
    
    if (!brevoApiKey) {
      console.warn('Email sending skipped: BREVO_API_KEY not set');
      throw new Error('Brevo API key is not configured');
    }
    
    // Debug log API key prefix
    const keyPrefix = brevoApiKey.substring(0, 5);
    console.log(`Using Brevo API key with prefix: ${keyPrefix}...`);
    
    // Select appropriate sender email based on email type/content
    let senderEmail = NOTIFICATION_SENDER;
    
    if (params.subject.toLowerCase().includes('invoice')) {
      senderEmail = INVOICE_SENDER;
    } else if (params.subject.toLowerCase().includes('receipt')) {
      senderEmail = INVOICE_SENDER;
    } else if (params.subject.toLowerCase().includes('support') || 
               params.subject.toLowerCase().includes('help') ||
               params.subject.toLowerCase().includes('contact')) {
      senderEmail = SUPPORT_SENDER;
    }

    // Format the sender with name
    const sender = {
      email: senderEmail,
      name: 'AdiTeke Software Solutions'
    };
    
    // Use reply-to for custom sender addresses
    const replyTo = params.from && params.from !== senderEmail ? 
      { email: params.from } : undefined;
    
    // Always include plain text for better deliverability
    const plainText = params.text || (params.html ? htmlToPlainText(params.html) : 'Please enable HTML to view this email properly.');
    
    // Prepare API request payload with enhanced deliverability features
    const payload = {
      sender,
      replyTo,
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html || undefined,
      textContent: plainText,
      attachment: params.attachments ? params.attachments.map(attachment => ({
        content: attachment.content,
        name: attachment.filename
      })) : undefined,
      headers: {
        'X-Mailer': 'AdiTeke-Mailer/1.0',
        'X-Entity-Ref-ID': `aditeke-${Date.now()}`,
        'List-Unsubscribe': '<mailto:unsubscribe@aditeke.com>'
      }
    };
    
    console.log('Attempting to send email via Brevo API to:', params.to);
    console.log('Using Brevo API key prefix:', brevoApiKey.substring(0, 5) + '...');
    
    // Make a direct fetch request to the Brevo API
    const response = await fetch('https://api.sendinblue.com/v3/smtp/email', {
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
    console.log('Email sent successfully via Brevo:', result);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Error sending email with Brevo:', error);
    
    // Get error message
    const errorMessage = error.message || 'Unknown error occurred';
    
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
      from: INVOICE_SENDER, // Using our defined invoice sender
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
      from: INVOICE_SENDER, // Using our defined invoice sender
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