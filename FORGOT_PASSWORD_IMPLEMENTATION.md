# 🔐 Forgot Password Implementation Guide

## ✅ Implementation Summary

This document describes the complete **Forgot Password** functionality implemented for CaseXpert.

---

## 📋 Table of Contents

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Security Features](#security-features)
4. [Setup Instructions](#setup-instructions)
5. [Testing Guide](#testing-guide)
6. [API Documentation](#api-documentation)

---

## 🔧 Backend Implementation

### 1. Database Changes

**Migration File**: `backend/migrations/add_password_reset_fields.js`

**New Columns Added to `users` Table:**
- `resetPasswordToken` (VARCHAR(255)) - Stores hashed reset token
- `resetPasswordExpire` (DATETIME) - Token expiry timestamp

**To Run Migration:**
```bash
cd backend
node migrations/add_password_reset_fields.js
```

### 2. Controller Functions

**File**: `backend/controllers/authController.js`

#### `forgotPassword(req, res)`
- **Endpoint**: `POST /api/auth/forgot-password`
- **Request Body**: `{ email }`
- **Functionality**:
  - Validates email input
  - Finds user by email (returns generic message if not found for security)
  - Generates secure 32-byte random token using `crypto.randomBytes()`
  - Hashes token with SHA-256 before storing in database
  - Sets token expiry to 15 minutes
  - Sends password reset email with reset link
  - Returns success message (same message whether user exists or not)

#### `resetPassword(req, res)`
- **Endpoint**: `POST /api/auth/reset-password/:token`
- **Request Body**: `{ password }`
- **Functionality**:
  - Validates password meets security requirements
  - Hashes incoming token to compare with database
  - Finds user with matching token and non-expired timestamp
  - Validates password requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
  - Hashes new password with bcrypt
  - Updates password and clears reset token fields
  - Sends confirmation email
  - Returns success message

### 3. Routes

**File**: `backend/routes/authRoutes.js`

```javascript
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
```

### 4. Email Service

**File**: `backend/utils/sendEmail.js`

Uses **nodemailer** with SMTP configuration for sending emails.

**Email Template Features**:
- Professional HTML design
- Clear call-to-action button
- Fallback link for email clients that don't support buttons
- 15-minute expiry warning
- Security notice for users who didn't request the reset

---

## 🎨 Frontend Implementation

### 1. Forgot Password Page

**File**: `frontend/src/pages/ForgotPassword.jsx`

**Features**:
- Clean, professional UI with dark mode support
- Email input field with validation
- Loading state during API call
- Success screen after email is sent
- Link to return to login page

**User Flow**:
1. User enters email address
2. Clicks "Send Reset Link"
3. System shows success message
4. User receives email with reset link

### 2. Reset Password Page

**File**: `frontend/src/pages/ResetPassword.jsx`

**Features**:
- Password and confirm password fields
- Real-time password validation
- Clear error messages for validation failures
- Loading state during password reset
- Success screen with auto-redirect to login
- Dark mode support

**User Flow**:
1. User clicks reset link from email
2. Enters new password and confirms it
3. System validates password requirements
4. On success, user is redirected to login page

### 3. Routes

**File**: `frontend/src/App.jsx`

```javascript
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

### 4. Login Page Enhancement

**File**: `frontend/src/pages/Login.jsx`

Added "Forgot Password?" link next to remember me checkbox.

---

## 🔒 Security Features

### 1. Token Security
- ✅ Tokens are generated using cryptographically secure random bytes
- ✅ Tokens are hashed (SHA-256) before storing in database
- ✅ Plain token is never stored, only sent in email
- ✅ Token expires after 15 minutes
- ✅ Token is single-use (cleared after successful reset)

### 2. Email Enumeration Prevention
- ✅ Same success message returned whether email exists or not
- ✅ Prevents attackers from discovering valid email addresses

### 3. Password Requirements
- ✅ Minimum 8 characters
- ✅ Must include uppercase letter
- ✅ Must include lowercase letter
- ✅ Must include number
- ✅ Must include special character
- ✅ Password is hashed with bcrypt before storage

### 4. Error Handling
- ✅ Invalid token returns clear error message
- ✅ Expired token returns clear error message
- ✅ Database errors are caught and logged
- ✅ Email sending failures are handled gracefully

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment Variables

Update `backend/.env` with your SMTP credentials:

```env
# SMTP Email Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
FROM_EMAIL=noreply@casexpert.com
FROM_NAME=CaseXpert Support
FRONTEND_URL=http://localhost:5173
```

**For Development (Mailtrap)**:
1. Sign up at https://mailtrap.io
2. Get your SMTP credentials from the dashboard
3. Update `SMTP_EMAIL` and `SMTP_PASSWORD` in `.env`

**For Production (Gmail, SendGrid, etc.)**:
Update the SMTP settings according to your email provider.

### 3. Run Database Migration

```bash
cd backend
node migrations/add_password_reset_fields.js
```

### 4. Restart Backend Server

```bash
npm start
```

---

## 🧪 Testing Guide

### Test Scenario 1: Successful Password Reset Flow

1. **Request Password Reset**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```
   
   Expected Response:
   ```json
   {
     "success": true,
     "message": "If this email is registered, you will receive password reset instructions."
   }
   ```

2. **Check Email**:
   - Open Mailtrap inbox
   - Find reset email
   - Copy reset token from URL

3. **Reset Password**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/reset-password/YOUR_TOKEN_HERE \
     -H "Content-Type: application/json" \
     -d '{"password": "NewPassword123!"}'
   ```
   
   Expected Response:
   ```json
   {
     "success": true,
     "message": "Password has been reset successfully. You can now login with your new password."
   }
   ```

4. **Login with New Password**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "NewPassword123!"}'
   ```

### Test Scenario 2: Invalid Email

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com"}'
```

Expected: Same success message (security feature)

### Test Scenario 3: Expired Token

Wait 15+ minutes after requesting reset, then try to reset password.

Expected Response:
```json
{
  "success": false,
  "message": "Invalid or expired password reset token"
}
```

### Test Scenario 4: Weak Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password/VALID_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"password": "weak"}'
```

Expected Response:
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

---

## 📚 API Documentation

### POST /api/auth/forgot-password

**Description**: Request a password reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "If this email is registered, you will receive password reset instructions."
}
```

**Error Responses**:
- `400`: Email is required
- `500`: Email could not be sent / Database error

---

### POST /api/auth/reset-password/:token

**Description**: Reset password using token from email

**URL Parameters**:
- `token`: Reset token from email link

**Request Body**:
```json
{
  "password": "NewSecurePassword123!"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Responses**:
- `400`: Invalid or expired token / Password validation failed
- `500`: Database error

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

---

## 📧 Email Templates

### Password Reset Email

**Subject**: Password Reset Request - CaseXpert

**Content**:
- Greeting with user's name
- Clear explanation of what happened
- Prominent "Reset Password" button
- Plain text link as fallback
- 15-minute expiry warning
- Security notice for unauthorized requests
- Professional footer

### Password Reset Confirmation Email

**Subject**: Password Reset Successful - CaseXpert

**Content**:
- Confirmation message
- Security notice
- Contact support link if unauthorized

---

## 🔍 Troubleshooting

### Email Not Being Sent

**Check**:
1. SMTP credentials in `.env` are correct
2. SMTP host and port are correct
3. Check backend console for error messages
4. Verify firewall isn't blocking SMTP port

### Token Invalid/Expired

**Possible Causes**:
1. More than 15 minutes have passed
2. Token was already used
3. Token was modified/truncated in email

**Solution**:
Request a new password reset email

### Password Validation Failing

**Ensure Password**:
- Is at least 8 characters long
- Contains at least one uppercase letter (A-Z)
- Contains at least one lowercase letter (a-z)
- Contains at least one number (0-9)
- Contains at least one special character (!@#$%^&*(),.?":{}|<>)

---

## 📝 Files Modified/Created

### Backend
- ✅ `controllers/authController.js` - Added forgotPassword and resetPassword functions
- ✅ `routes/authRoutes.js` - Added routes for forgot and reset password
- ✅ `migrations/add_password_reset_fields.js` - Database migration
- ✅ `.env` - Added SMTP configuration
- ✅ `utils/sendEmail.js` - Already existed, used for sending emails

### Frontend
- ✅ `pages/ForgotPassword.jsx` - Already existed, verified implementation
- ✅ `pages/ResetPassword.jsx` - Updated to use correct API endpoint
- ✅ `pages/Login.jsx` - Added "Forgot Password?" link
- ✅ `App.jsx` - Added routes for forgot/reset password

---

## ✨ Features Summary

✅ Secure token generation with crypto  
✅ Token hashing before database storage  
✅ 15-minute token expiry  
✅ Email enumeration prevention  
✅ Strong password validation  
✅ Professional email templates  
✅ User-friendly frontend pages  
✅ Dark mode support  
✅ Loading states and error handling  
✅ Confirmation emails  
✅ Auto-redirect after success  

---

## 🎯 Next Steps (Optional Enhancements)

1. **Rate Limiting**: Limit password reset requests per email/IP
2. **SMS Verification**: Add SMS-based 2FA for extra security
3. **Password History**: Prevent reuse of recent passwords
4. **Custom Email Templates**: Use HTML email builder
5. **Multi-language Support**: Translate email templates
6. **Audit Logging**: Log all password reset attempts
7. **Account Lockout**: Lock account after too many failed attempts

---

## 📞 Support

For issues or questions, please contact the development team or open an issue in the project repository.

---

**Last Updated**: February 16, 2026  
**Version**: 1.0.0  
**Author**: CaseXpert Development Team
