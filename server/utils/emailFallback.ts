import { ClientInvoice, User } from '../../shared/schema';
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