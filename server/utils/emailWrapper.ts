// Email service wrapper that uses real service if available or falls back to console logging
import { ClientInvoice, User } from '../../shared/schema';
import * as EmailFallback from './emailFallback';

// Email attachment interface
interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

/**
 * Send an email using the real service if available, otherwise use fallback
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
    // Check if API key is available
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send email using real Brevo service...');
        return await emailService.sendEmail(params);
      } catch (error: any) {
        console.warn('Real email service failed, using fallback:', error.message);
        return await EmailFallback.logEmailToConsole(params);
      }
    } else {
      // Use fallback directly
      console.log('Using email fallback mode (real service not available)');
      return await EmailFallback.logEmailToConsole(params);
    }
  } catch (error: any) {
    console.error('Email wrapper error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Send an invoice email using the real service if available, otherwise use fallback
 */
export async function sendInvoicePdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send invoice email using real Brevo service...');
        return await emailService.sendInvoicePdfEmail(invoice, client, customSubject, customMessage, customEmail);
      } catch (error: any) {
        console.warn('Real invoice email service failed, using fallback:', error.message);
        return await EmailFallback.logInvoiceEmail(invoice, client, customSubject, customMessage, customEmail);
      }
    } else {
      // Use fallback directly
      console.log('Using invoice email fallback mode (real service not available)');
      return await EmailFallback.logInvoiceEmail(invoice, client, customSubject, customMessage, customEmail);
    }
  } catch (error: any) {
    console.error('Invoice email wrapper error:', error);
    throw new Error(`Invoice email sending failed: ${error.message}`);
  }
}

/**
 * Send a receipt email using the real service if available, otherwise use fallback
 */
export async function sendReceiptPdfEmail(invoice: ClientInvoice, client: User, customSubject?: string, customMessage?: string, customEmail?: string) {
  try {
    // Check if API key is configured
    if (process.env.BREVO_API_KEY) {
      try {
        // Dynamically import for each call to ensure latest env vars
        const emailService = await import('./emailService');
        
        // Try with real service
        console.log('Attempting to send receipt email using real Brevo service...');
        return await emailService.sendReceiptPdfEmail(invoice, client, customSubject, customMessage, customEmail);
      } catch (error: any) {
        console.warn('Real receipt email service failed, using fallback:', error.message);
        return await EmailFallback.logReceiptEmail(invoice, client, customSubject, customMessage, customEmail);
      }
    } else {
      // Use fallback directly
      console.log('Using receipt email fallback mode (real service not available)');
      return await EmailFallback.logReceiptEmail(invoice, client, customSubject, customMessage, customEmail);
    }
  } catch (error: any) {
    console.error('Receipt email wrapper error:', error);
    throw new Error(`Receipt email sending failed: ${error.message}`);
  }
}