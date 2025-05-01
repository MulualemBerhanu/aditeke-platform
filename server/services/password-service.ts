/**
 * Password Service
 * Handles secure password generation, hashing, and validation
 */

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Configuration
const TEMPORARY_PASSWORD_LENGTH = 10;

/**
 * Generate a secure random password
 * Creates a random alphanumeric string for temporary passwords
 * 
 * @returns Randomly generated password
 */
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let password = '';
  const randomBytesBuffer = randomBytes(TEMPORARY_PASSWORD_LENGTH);
  
  for (let i = 0; i < TEMPORARY_PASSWORD_LENGTH; i++) {
    const randomIndex = randomBytesBuffer[i] % chars.length;
    password += chars.charAt(randomIndex);
  }
  
  return password;
}

/**
 * Hash a password using scrypt with a random salt
 * 
 * @param password Plain text password to hash
 * @returns Hashed password with salt in format 'hash.salt'
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password against a stored hashed password
 * 
 * @param supplied Plain text password to verify
 * @param stored Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Validate password strength
 * 
 * @param password Password to validate
 * @returns Object with validation result and possible error message
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one digit
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
}