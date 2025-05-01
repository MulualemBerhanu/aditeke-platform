/**
 * Email Service
 * Manages email communications for user onboarding and password management
 */

// Import the enhanced wrapper functions with fallback capability
import { 
  sendWelcomeEmail as sendWrappedWelcomeEmail,
  sendPasswordResetEmail as sendWrappedPasswordResetEmail
} from '../utils/emailWrapper';

/**
 * Send a welcome email to a new user with their temporary password
 * Using the enhanced wrapper with fallback mechanism
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
    
    // Use the enhanced wrapper that handles Brevo IP restrictions and fallbacks
    const result = await sendWrappedWelcomeEmail(params);
    
    console.log(`Welcome email to ${params.email} result:`, result);
    return true;
  } catch (error: any) {
    console.error(`Error sending welcome email:`, error);
    console.error(`Error details:`, error.message);
    return false;
  }
}

/**
 * Send a password reset email with a reset link
 * Using the enhanced wrapper with fallback mechanism
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
    
    // Use the enhanced wrapper that handles Brevo IP restrictions and fallbacks
    const result = await sendWrappedPasswordResetEmail(params);
    
    console.log(`Password reset email to ${params.email} result:`, result);
    return true;
  } catch (error: any) {
    console.error(`Error sending password reset email:`, error);
    console.error(`Error details:`, error.message);
    return false;
  }
}