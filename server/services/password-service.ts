/**
 * Password Service
 * Handles password generation, verification, and security features
 */

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Generate a secure random temporary password
 * Creates a password with a mix of uppercase, lowercase, numbers, and symbols
 * @returns Secure random password
 */
export function generateSecurePassword(length = 12): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O to avoid confusion
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // no l to avoid confusion
  const numberChars = '23456789'; // no 0/1 to avoid confusion with O/l
  const symbolChars = '!@#$%^&*()-_=+[]{};:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + symbolChars;
  
  // Ensure at least one character from each type
  let password = 
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to randomize the order of character types
  return shuffleString(password);
}

/**
 * Shuffle a string (Fisher-Yates algorithm)
 * @param str String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Hash a password for secure storage
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hash
 * @param supplied Plain text password
 * @param stored Hashed password
 * @returns True if matching
 */
export async function comparePasswords(supplied: string, stored: string | undefined): Promise<boolean> {
  if (!stored) return false;
  
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Check if a user needs to reset their password based on the passwordResetRequired flag
 * @param user User object
 * @returns True if password reset is required
 */
export function isPasswordResetRequired(user: any): boolean {
  return !!user?.passwordResetRequired;
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for at least one digit
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one digit'
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false, 
      message: 'Password must contain at least one special character'
    };
  }
  
  return { isValid: true };
}