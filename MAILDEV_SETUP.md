# 📨 MailDev Local Email Testing Setup

## ✅ Implementation Complete

I have successfully configured MailDev for your local development environment.

### 🔧 Configuration Details

**1. Environment Variables (`.env`)**
```env
# MailDev Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=noreply@casexpert.com
FROM_NAME=CaseXpert Support
```

**2. Email Service (`backend/services/emailService.js`)**
- Automatically detects environment (Development vs Production)
- **Development Mode**: Uses MailDev (localhost:1025) with detailed logging
- **Production Mode**: Uses real SMTP credentials
- **Logging**: Logs full email details to console for debugging
- **Templates**: Professional HTML templates for password reset and confirmation

**3. Integration**
- `authController.js` now uses the new `emailService`
- Forgot Password flow uses `passwordResetEmail` template
- Reset Password flow uses `passwordResetConfirmationEmail` template

---

## 🚀 How to Use

### Step 1: Install & Start MailDev (If not already running)

Open a **new terminal** window and run:

```bash
# Install globally (one-time)
npm install -g maildev

# Start MailDev
maildev
```

You should see:
```
MailDev webapp running at http://0.0.0.0:1080
MailDev SMTP Server running at 0.0.0.0:1025
```

### Step 2: Test the Flow

1. **Go to Login**: http://localhost:5173/login
2. Click **"Forgot Password?"**
3. Enter any email (e.g., `test@example.com`)
4. **Result**:
   - Backend console will show: `📨 Sending Email...` and `✅ Email sent successfully!`
   - Terminal will show **full email preview** (Subject, To, Content snippet)

### Step 3: View Emails

Open your browser to: **http://localhost:1080**

You will see the email in the MailDev inbox! 📩

---

## 🔍 Debugging

If email is not working:
1. Ensure **MailDev is running** (`maildev` in terminal)
2. Ensure backend server was **restarted** after `.env` changes (`npm start`)
3. Check backend console for error messages

## 📦 Production Deployment

When deploying to production:
1. Set `NODE_ENV=production`
2. Update `.env` with real SMTP credentials (Gmail, SendGrid, etc.)
3. The service will automatically switch to secure SMTP with authentication.
