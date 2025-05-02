# AdiTeke Software Solutions - Email Functionality Documentation

## Overview

This document provides details about the email functionality in the AdiTeke Software Solutions platform. The application uses Brevo (formerly Sendinblue) as the primary email service provider, with a well-structured architecture to ensure reliable email delivery.

## Email Service Architecture

The email system is built with multiple layers:

1. **Direct Brevo API Layer** (`directBrevoService.ts`): Uses the Brevo API directly with fetch requests
2. **Email Wrapper Layer** (`emailWrapper.ts`): Provides a consistent interface and handles fallbacks
3. **Service-Specific Implementations**:
   - Welcome emails
   - Password reset emails
   - Notification emails
   - Invoice emails
   - Receipt emails
   - Generic/custom emails

## Key Email Features

### Welcome Emails
- Sent when new clients are created
- Contains login details and temporary password
- Requires password reset on first login
- **Test endpoint**: `/api/public/test-welcome-email`

### Password Reset Emails
- Secure token-based password reset
- Time-limited token (24 hours default)
- **Test endpoint**: `/api/public/test-password-reset`

### Verification Emails
- Account verification with secure tokens
- Time-limited token (48 hours default)
- **Test endpoint**: `/api/public/test-verification-email`

### Notification Emails
- Project status updates
- General system notifications
- Custom templates with variable content
- **Test endpoint**: `/api/public/test-notification`

### Invoice/Receipt Emails
- PDF attachments generated on-the-fly
- Customizable subject and message
- **Test endpoints**: 
  - `/api/public/test-invoice-email`
  - `/api/public/test-receipt-email`

### Generic Emails
- Flexible custom emails for any purpose
- **Test endpoint**: `/api/public/test-generic-email?to=email&subject=subject&message=message`

## Troubleshooting

Recent issues with the email system were resolved by:

1. Identifying that IP restrictions in the Brevo account were blocking emails from the server
2. Disabling IP restrictions in the Brevo account settings
3. Implementing robust direct API access to bypass potential IP blocks
4. Adding comprehensive test endpoints to verify all email functionality
5. Creating a fallback system via emailWrapper

## Sending Test Emails

You can test the email functionality using the provided test endpoints:

```bash
# Test welcome email
curl -X GET http://localhost:5000/api/public/test-welcome-email

# Test password reset email
curl -X GET http://localhost:5000/api/public/test-password-reset

# Test verification email
curl -X GET http://localhost:5000/api/public/test-verification-email

# Test notification email
curl -X GET http://localhost:5000/api/public/test-notification

# Test generic custom email
curl -X GET "http://localhost:5000/api/public/test-generic-email?to=email@example.com&subject=Test&message=Hello"

# Test invoice email
curl -X GET http://localhost:5000/api/public/test-invoice-email

# Test receipt email
curl -X GET http://localhost:5000/api/public/test-receipt-email

# Test direct Brevo API
curl -X GET http://localhost:5000/api/public/direct-email-test
```

## Email Templates

All email templates follow a consistent design pattern:
1. Company header with logo/colors
2. Personalized greeting
3. Main content section
4. Call-to-action button when applicable
5. Company footer with contact information

Each email type has both HTML and plain text versions to ensure maximum compatibility across email clients.

## Configuration

The email system uses the following environment variables:
- `BREVO_API_KEY`: API key for the Brevo service

The verified sender email address is configured in the application as:
- Email: `mule2069@gmail.com`
- Name: "AdiTeke Software Solutions" (can be customized per email type)

## Best Practices

1. Always use the email wrapper rather than direct implementation in production code
2. Include both HTML and plain text versions of emails
3. Test emails using the dedicated test endpoints
4. Monitor email delivery and bounce rates in the Brevo dashboard