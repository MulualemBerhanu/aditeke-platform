import sgMail from '@sendgrid/mail';
import { createReadStream } from 'fs';
import { ClientInvoice, User } from '@shared/schema';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

/**
 * Sends an email with optional attachments
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments: EmailAttachment[] = []
) {
  try {
    const msg = {
      to,
      from: 'contact@aditeke.com', // Verified sender email
      subject,
      html,
      attachments,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    return { success: true, statusCode: response[0].statusCode };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Generates an invoice PDF and sends it as an email attachment
 */
export async function sendInvoicePdfEmail(invoice: ClientInvoice, client: User) {
  try {
    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);
    
    // Add company logo/branding
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0040A1');
    doc.text('AdiTeke Software Solutions', {
      align: 'left'
    });
    
    // Reset color for rest of document
    doc.fillColor('#333333').font('Helvetica');
    
    // Add company address
    doc.fontSize(10);
    doc.text('Portland, OR, USA', {
      align: 'left'
    });
    doc.text('contact@aditeke.com', {
      align: 'left'
    });
    doc.text('www.aditeke.com', {
      align: 'left'
    });
    doc.moveDown(2);
    
    // Add invoice title and details
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('INVOICE', {
      align: 'right'
    });
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Invoice #${invoice.invoiceNumber}`, {
      align: 'right'
    });
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, {
      align: 'right'
    });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
      align: 'right'
    });
    doc.moveDown(2);
    
    // Add client info
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Bill To:');
    doc.fontSize(12).font('Helvetica');
    doc.text(client.name || client.username);
    doc.text(client.email || '');
    doc.text(client.company || '');
    doc.moveDown(2);
    
    // Add payment details section
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Invoice Details');
    
    // Add table headers
    const tableTop = doc.y + 20;
    doc.font('Helvetica-Bold')
       .text('Description', 50, tableTop)
       .text('Qty', 300, tableTop)
       .text('Rate', 350, tableTop)
       .text('Amount', 450, tableTop, { width: 90, align: 'right' });
    
    // Draw a line for the header
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    // Add item details
    doc.font('Helvetica');
    let y = tableTop + 30;
    
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item, index) => {
        const position = y + (index * 25);
        doc.text(item.description, 50, position)
           .text(item.quantity ? String(item.quantity) : '1', 300, position)
           .text(`$${item.amount.toFixed(2)}`, 350, position)
           .text(`$${(item.amount * (item.quantity || 1)).toFixed(2)}`, 450, position, { width: 90, align: 'right' });
      });
    } else {
      // If no items, just show the description and total
      doc.text(invoice.description || 'Professional Services', 50, y)
         .text('1', 300, y)
         .text(`$${Number(invoice.amount).toFixed(2)}`, 350, y)
         .text(`$${Number(invoice.amount).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    }
    
    // Draw a line for the total
    const summaryTop = y + (invoice.items && invoice.items.length > 0 ? invoice.items.length * 25 : 25) + 10;
    doc.moveTo(50, summaryTop)
       .lineTo(550, summaryTop)
       .stroke();
    
    // Add total amount
    doc.font('Helvetica-Bold')
       .text('Total:', 350, summaryTop + 10)
       .text(`$${Number(invoice.amount).toFixed(2)}`, 450, summaryTop + 10, { width: 90, align: 'right' });
    
    // Add payment instructions
    const instructionsTop = summaryTop + 40;
    doc.font('Helvetica-Bold').fontSize(14)
       .text('Payment Instructions', 50, instructionsTop);
    doc.font('Helvetica').fontSize(12)
       .text('Please make payment by the due date to the following account:', 50, instructionsTop + 25);
    doc.text('Bank: US National Bank', 50, instructionsTop + 45);
    doc.text('Account: AdiTeke Software Solutions', 50, instructionsTop + 65);
    doc.text('Account #: XXXX-XXXX-1234', 50, instructionsTop + 85);
    doc.text('Reference: Invoice #' + invoice.invoiceNumber, 50, instructionsTop + 105);
    
    // Add notes if any
    if (invoice.notes) {
      const notesTop = instructionsTop + 130;
      doc.font('Helvetica-Bold').fontSize(14)
         .text('Notes', 50, notesTop);
      doc.font('Helvetica').fontSize(12)
         .text(invoice.notes, 50, notesTop + 20);
    }
    
    // Add a thank you message
    doc.moveDown(4);
    doc.font('Helvetica-Bold').fontSize(14)
       .text('Thank you for your business!', { align: 'center' });
    
    // Add footer
    const pageHeight = doc.page.height;
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).text(
      'This invoice was generated electronically by AdiTeke Software Solutions.',
      50, pageHeight - 70,
      { align: 'center' }
    );
    
    // Finalize the PDF
    doc.end();
    
    // Collect chunks to convert to base64
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    
    const pdfBase64Promise = new Promise<string>((resolve, reject) => {
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfBase64 = pdfBuffer.toString('base64');
        resolve(pdfBase64);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
    
    const pdfBase64 = await pdfBase64Promise;
    
    // Create email content
    const emailHtml = `
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
    
    // Send email with PDF attachment
    await sendEmail(
      client.email,
      `Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`,
      emailHtml,
      [
        {
          content: pdfBase64,
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

/**
 * Generates a receipt PDF and sends it as an email attachment
 */
export async function sendReceiptPdfEmail(invoice: ClientInvoice, client: User) {
  try {
    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);
    
    // Add company logo/branding
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0040A1');
    doc.text('AdiTeke Software Solutions', {
      align: 'left'
    });
    
    // Reset color for rest of document
    doc.fillColor('#333333').font('Helvetica');
    
    // Add company address
    doc.fontSize(10);
    doc.text('Portland, OR, USA', {
      align: 'left'
    });
    doc.text('contact@aditeke.com', {
      align: 'left'
    });
    doc.text('www.aditeke.com', {
      align: 'left'
    });
    doc.moveDown(2);
    
    // Add receipt title and details
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('RECEIPT', {
      align: 'right'
    });
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Receipt #${invoice.receiptNumber || `RCPT-${Date.now()}`}`, {
      align: 'right'
    });
    doc.text(`Invoice #${invoice.invoiceNumber}`, {
      align: 'right'
    });
    doc.text(`Date: ${new Date(invoice.paidDate || new Date()).toLocaleDateString()}`, {
      align: 'right'
    });
    doc.moveDown(2);
    
    // Add client info
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Bill To:');
    doc.fontSize(12).font('Helvetica');
    doc.text(client.name || client.username);
    doc.text(client.email || '');
    doc.text(client.company || '');
    doc.moveDown(2);
    
    // Add payment information
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Payment Information');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Payment Method: ${invoice.paymentMethod ? invoice.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Manual'}`);
    doc.text(`Amount Paid: $${Number(invoice.paidAmount || invoice.amount).toFixed(2)}`);
    doc.text(`Original Invoice Amount: $${Number(invoice.amount).toFixed(2)}`);
    doc.moveDown(2);
    
    // Add payment details
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Payment Details');
    
    // Add table headers
    const tableTop = doc.y + 20;
    doc.font('Helvetica-Bold')
       .text('Description', 50, tableTop)
       .text('Amount', 500, tableTop, { width: 90, align: 'right' });
    
    // Draw a line for the header
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    // Add item details
    doc.font('Helvetica');
    let y = tableTop + 30;
    
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item, index) => {
        const position = y + (index * 25);
        doc.text(item.description, 50, position)
           .text(`$${(item.amount * (item.quantity || 1)).toFixed(2)}`, 500, position, { width: 90, align: 'right' });
      });
    } else {
      // If no items, just show the total paid amount
      doc.text(invoice.description || 'Payment for services', 50, y)
         .text(`$${Number(invoice.paidAmount || invoice.amount).toFixed(2)}`, 500, y, { width: 90, align: 'right' });
    }
    
    // Draw a line for the total
    const summaryTop = y + (invoice.items && invoice.items.length > 0 ? invoice.items.length * 25 : 25) + 10;
    doc.moveTo(50, summaryTop)
       .lineTo(550, summaryTop)
       .stroke();
    
    // Add total paid amount
    doc.font('Helvetica-Bold')
       .text('Total Paid:', 400, summaryTop + 10)
       .text(`$${Number(invoice.paidAmount || invoice.amount).toFixed(2)}`, 500, summaryTop + 10, { width: 90, align: 'right' });
    
    // Add notes if any
    if (invoice.notes) {
      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(14)
         .text('Notes');
      doc.font('Helvetica').fontSize(12)
         .text(invoice.notes);
    }
    
    // Add a thank you message
    doc.moveDown(4);
    doc.font('Helvetica-Bold').fontSize(14)
       .text('Thank you for your business!', { align: 'center' });
    
    // Add a footer
    const pageHeight = doc.page.height;
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).text(
      'This receipt was generated electronically and is valid without a signature.',
      50, pageHeight - 70,
      { align: 'center' }
    );
    
    // Finalize the PDF
    doc.end();
    
    // Collect chunks to convert to base64
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    
    const pdfBase64Promise = new Promise<string>((resolve, reject) => {
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfBase64 = pdfBuffer.toString('base64');
        resolve(pdfBase64);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
    
    const pdfBase64 = await pdfBase64Promise;
    
    // Create email content
    const emailHtml = `
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
    
    // Send email with PDF attachment
    await sendEmail(
      client.email,
      `Receipt for Invoice #${invoice.invoiceNumber} from AdiTeke Software Solutions`,
      emailHtml,
      [
        {
          content: pdfBase64,
          filename: `Receipt-${invoice.receiptNumber || Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
}