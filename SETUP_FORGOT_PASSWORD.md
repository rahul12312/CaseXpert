# 🚀 Quick Setup Guide for Forgot Password

## ✅ What Was Implemented

Complete forgot password functionality with:
- ✅ Backend API endpoints
- ✅ Database fields added
- ✅ Email service configured
- ✅ Frontend pages ready
- ✅ Security features implemented

---

## ⚙️ Setup Steps (5 minutes)

### Step 1: Configure Email Settings ⚠️ REQUIRED

You need to add your SMTP credentials to send password reset emails.

**Option A: Development (Mailtrap - Free)**

1. Go to https://mailtrap.io and sign up for free
2. Go to "Email Testing" > "Inboxes" > "My Inbox"
3. Click "Show Credentials"
4. Copy your username and password

5. Open `backend/.env` and update these lines:
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_username_here    # ⚠️ UPDATE THIS
SMTP_PASSWORD=your_mailtrap_password_here # ⚠️ UPDATE THIS
FROM_EMAIL=noreply@casexpert.com
FROM_NAME=CaseXpert Support
```

**Option B: Production (Gmail)**

1. Enable 2-Step Verification in your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com           # ⚠️ UPDATE THIS
SMTP_PASSWORD=your-app-password-here      # ⚠️ UPDATE THIS (16 characters)
FROM_EMAIL=your-email@gmail.com
FROM_NAME=CaseXpert Support
```

### Step 2: Verify Database Migration

The migration should already be complete. To verify:

```bash
cd backend
node migrations/add_password_reset_fields.js
```

You should see:
```
✅ Password reset fields migration completed successfully!
```

### Step 3: Restart Backend Server

**If your server is running**, restart it to load new environment variables:

```bash
# Press Ctrl+C to stop the server
# Then restart:
npm start
```

---

## ✨ Testing the Feature

### Frontend Testing (Easy Way)

1. **Go to Login Page**: http://localhost:5173/login
2. **Click** "Forgot Password?" link
3. **Enter your email** and click "Send Reset Link"
4. **Check your email** (Mailtrap inbox or your Gmail)
5. **Click the reset link** in the email
6. **Enter new password** and confirm
7. **Login** with your new password

### Testing Flow Diagram

```
User Flow:
─────────
Login Page → Click "Forgot Password?"
    ↓
Forgot Password Page → Enter Email → Submit
    ↓
Success Message → "Check your email"
    ↓
Email Received → Click "Reset Password" Button
    ↓
Reset Password Page → Enter New Password → Submit
    ↓
Success → Auto-redirect to Login Page
    ↓
Login with New Password → ✅ Success!
```

---

## 🔧 API Endpoints

### 1. Request Password Reset
```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 2. Reset Password
```
POST http://localhost:5000/api/auth/reset-password/{token}
Content-Type: application/json

{
  "password": "NewPassword123!"
}
```

---

## 🔒 Password Requirements

New passwords must have:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*(),.?":{}|<>)

Examples:
- ✅ `MyPassword123!`
- ✅ `SecurePass@2024`
- ❌ `password` (no uppercase, number, or special char)
- ❌ `Pass123` (too short, no special char)

---

## 🐛 Troubleshooting

### Problem: Email not being sent

**Check**:
1. ✅ SMTP credentials in `.env` are correct (no extra spaces)
2. ✅ Backend server was restarted after updating `.env`
3. ✅ Check backend console for "✅ Password reset email sent successfully"

**If you see an error**:
- Double-check your SMTP_EMAIL and SMTP_PASSWORD
- Make sure there are no quotes around the values in `.env`
- Verify your email service is working (try logging into Mailtrap/Gmail)

### Problem: "Invalid or expired token"

**Reasons**:
- Token expires after **15 minutes**
- Token can only be used **once**

**Solution**: Request a new password reset email

### Problem: Password validation failing

**Make sure your password**:
- Has at least 8 characters
- Contains uppercase AND lowercase letters
- Contains at least one number
- Contains at least one special character

Example valid password: `MyNewPass123!`

---

## 📁 Files Changed

### Backend
```
✅ controllers/authController.js     - Added forgot & reset password logic
✅ routes/authRoutes.js               - Added new routes
✅ migrations/add_password_reset_fields.js - Database migration
✅ .env                               - Added SMTP configuration
✅ package.json                       - Added nodemailer dependency
```

### Frontend
```
✅ pages/ForgotPassword.jsx          - Forgot password page
✅ pages/ResetPassword.jsx           - Reset password page
✅ pages/Login.jsx                   - Added "Forgot Password?" link
✅ App.jsx                           - Added routes
```

---

## 🎯 Quick Test Checklist

- [ ] SMTP credentials added to `.env`
- [ ] Backend server restarted
- [ ] Can access http://localhost:5173/forgot-password
- [ ] Can submit email on forgot password page
- [ ] Receive email in inbox (Mailtrap or Gmail)
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

---

## 🔐 Security Features Implemented

✅ Cryptographically secure random tokens (32 bytes)  
✅ Tokens hashed with SHA-256 before database storage  
✅ 15-minute token expiry  
✅ Email enumeration prevention  
✅ Password strength validation  
✅ Bcrypt password hashing  
✅ Single-use tokens  
✅ Confirmation emails  

---

## 📞 Need Help?

1. Check the detailed documentation: `FORGOT_PASSWORD_IMPLEMENTATION.md`
2. Check backend console for error messages
3. Verify email credentials are correct
4. Make sure database migration ran successfully

---

**Status**: ✅ Fully Implemented and Ready to Use

**Next Step**: Update `SMTP_EMAIL` and `SMTP_PASSWORD` in `backend/.env`
