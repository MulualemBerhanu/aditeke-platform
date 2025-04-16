const PDFDocument = require('pdfkit');
import { ClientInvoice, User } from '../../shared/schema';
import { PassThrough } from 'stream';

/**
 * Generates an invoice PDF
 */
export async function generateInvoicePdf(invoice: ClientInvoice, client: User): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      const stream = new PassThrough();
      
      // Collect data chunks
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
      
      // Pipe the PDF to the stream
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
      
      // Add invoice items (description and amount)
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Description', 50, doc.y, { width: 250 });
      doc.text('Amount', 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
      
      // Add a line
      doc.strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.5);
      
      // Add the invoice description
      doc.fontSize(12).font('Helvetica');
      doc.text(invoice.description || 'Professional Services', 50, doc.y, { width: 250 });
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
      
      // Add another line
      doc.strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(2);
      
      // Add total amount
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Total:', 350, doc.y);
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown(2);
      
      // Add payment instructions and terms
      doc.fontSize(12).font('Helvetica');
      doc.text('Payment Instructions:', 50, doc.y);
      doc.fontSize(10);
      doc.text('Please remit payment within the due date specified above.', 50, doc.y);
      doc.text('For questions concerning this invoice, please contact billing@aditeke.com.', 50, doc.y);
      doc.moveDown(1);
      
      // Add a thank you note
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Thank you for your business!', 50, doc.y);
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates a receipt PDF
 */
export async function generateReceiptPdf(invoice: ClientInvoice, client: User): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      const stream = new PassThrough();
      
      // Collect data chunks
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
      
      // Pipe the PDF to the stream
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
      doc.text(`Receipt for Invoice #${invoice.invoiceNumber}`, {
        align: 'right'
      });
      doc.text(`Payment Date: ${new Date(invoice.paidDate || new Date()).toLocaleDateString()}`, {
        align: 'right'
      });
      doc.moveDown(2);
      
      // Add client info
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Receipt To:');
      doc.fontSize(12).font('Helvetica');
      doc.text(client.name || client.username);
      doc.text(client.email || '');
      doc.text(client.company || '');
      doc.moveDown(2);
      
      // Add receipt items
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Description', 50, doc.y, { width: 250 });
      doc.text('Amount', 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
      
      // Add a line
      doc.strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.5);
      
      // Add the payment details
      doc.fontSize(12).font('Helvetica');
      doc.text(invoice.description || 'Professional Services', 50, doc.y, { width: 250 });
      doc.text(`$${Number(invoice.paidAmount || invoice.amount).toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
      
      // Add payment method
      if (invoice.paymentMethod) {
        doc.text(`Payment Method: ${invoice.paymentMethod.replace('_', ' ').toUpperCase()}`, 50, doc.y);
        doc.moveDown(0.5);
      }
      
      // Add another line
      doc.strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(1);
      
      // Add total amount
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Total Paid:', 350, doc.y);
      doc.text(`$${Number(invoice.paidAmount || invoice.amount).toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown(2);
      
      // Add payment confirmation
      doc.fontSize(12).font('Helvetica');
      doc.text('Payment Confirmation:', 50, doc.y);
      doc.fontSize(10);
      doc.text(`Your payment for Invoice #${invoice.invoiceNumber} has been received and processed. Thank you.`, 50, doc.y);
      doc.moveDown(1);
      
      // Add a thank you note
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Thank you for your business!', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}