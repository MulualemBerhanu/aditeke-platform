/**
 * Email Service
 * Manages email communications for user onboarding and password management
 */

// Import the direct Brevo implementations
import { 
  sendWelcomeEmail as sendDirectWelcomeEmail,
  sendPasswordResetEmail as sendDirectPasswordResetEmail
} from '../utils/directBrevoService';

// Import the fallback methods as backup
import { 
  sendWelcomeEmail as sendWrappedWelcomeEmail,
  sendPasswordResetEmail as sendWrappedPasswordResetEmail
} from '../utils/emailWrapper';

/**
 * Send a welcome email to a new user with their temporary password
 * Using the direct Brevo implementation first, with fallback
 * 
 * @param params Email parameters including recipient info and temporary password
 * @returns True if email was sent successfully
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
}): Promise<boolean> {
  try {
    console.log(`Preparing welcome email for ${params.username} (${params.email})`);
    
    try {
      // First try the direct Brevo implementation (same as invoices)
      console.log(`Attempting to send welcome email with direct Brevo implementation...`);
      const result = await sendDirectWelcomeEmail(params);
      console.log(`Welcome email sent successfully using direct Brevo to ${params.email}`);
      return true;
    } catch (directError: any) {
      console.error(`Direct Brevo email failed:`, directError.message);
      
      // Fall back to wrapper with fallback methods
      console.log(`Falling back to regular email wrapper...`);
      const result = await sendWrappedWelcomeEmail(params);
      console.log(`Welcome email fallback result for ${params.email}:`, result);
      return true;
    }
  } catch (error: any) {
    console.error(`Error sending welcome email:`, error);
    console.error(`Error details:`, error.message);
    return false;
  }
}

/**
 * Send a password reset email with a reset link
 * Using the direct Brevo implementation first, with fallback
 * 
 * @param params Email parameters including recipient info and reset link
 * @returns True if email was sent successfully
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  username: string;
  resetLink: string;
  expiryTime: number;
}): Promise<boolean> {
  try {
    console.log(`Preparing password reset email for ${params.username} (${params.email})`);
    
    try {
      // First try the direct Brevo implementation (same as invoices)
      console.log(`Attempting to send password reset email with direct Brevo implementation...`);
      const result = await sendDirectPasswordResetEmail(params);
      console.log(`Password reset email sent successfully using direct Brevo to ${params.email}`);
      return true;
    } catch (directError: any) {
      console.error(`Direct Brevo password reset email failed:`, directError.message);
      
      // Fall back to wrapper with fallback methods
      console.log(`Falling back to regular email wrapper...`);
      const result = await sendWrappedPasswordResetEmail(params);
      console.log(`Password reset email fallback result for ${params.email}:`, result);
      return true;
    }
  } catch (error: any) {
    console.error(`Error sending password reset email:`, error);
    console.error(`Error details:`, error.message);
    return false;
  }
}