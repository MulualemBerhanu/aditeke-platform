// Test script for Brevo email integration

// Import the email service module (using ES modules)
import { sendEmail } from './utils/emailService.js';

// Test function to send a simple email
async function testBrevoEmail() {
  console.log('Testing Brevo email integration...');
  
  try {
    // Send a test email
    const result = await sendEmail({
      to: 'berhanumulualemadisu@gmail.com', // Use the same verified sender for testing
      subject: 'Test Email from AdiTeke App',
      text: 'This is a test email to verify Brevo email integration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #0040A1;">Test Email</h1>
          <p>This is a test email to verify Brevo email integration is working correctly.</p>
          <p>If you received this email, it means the Brevo email service is properly configured!</p>
          <p style="margin-top: 15px;">Best regards,<br>AdiTeke Software Solutions</p>
        </div>
      `,
    });
    
    console.log('Email sent successfully!', result);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

// Execute the test function
testBrevoEmail()
  .then(success => {
    console.log(success ? 'Email test completed successfully!' : 'Email test failed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });