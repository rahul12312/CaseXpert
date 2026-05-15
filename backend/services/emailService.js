const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const dns = require('dns');

// Force IPv4 resolution first to prevent ENETUNREACH errors on systems with misconfigured IPv6
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// ============================================================
// TRANSPORTER — Gmail SMTP
// Use Gmail App Password in SMTP_PASSWORD (not your Gmail login)
// ============================================================
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
    family: 4,
    // Add debug logging
    debug: true,
    logger: true,
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Force specific ciphers if needed
        ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});


// ============================================================
// SEND OTP EMAIL — For account verification during registration
// ============================================================
exports.sendOTPEmail = async ({ userEmail, userName, otp }) => {
    try {
        const fromName = process.env.FROM_NAME || 'CaseXpert Support';
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; }
                    .wrapper { padding: 40px 20px; }
                    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 36px 40px; text-align: center; }
                    .header-icon { font-size: 40px; margin-bottom: 12px; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                    .header p { color: #94a3b8; margin: 6px 0 0; font-size: 14px; }
                    .body { padding: 40px; }
                    .greeting { font-size: 16px; color: #334155; margin-bottom: 20px; }
                    .greeting strong { color: #0f172a; }
                    .otp-label { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                    .otp-box { background: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 28px; text-align: center; margin: 20px 0; }
                    .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #1e3a8a; font-family: 'Courier New', monospace; }
                    .otp-expiry { font-size: 13px; color: #ef4444; margin-top: 12px; font-weight: 500; }
                    .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
                    .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
                    .info-box p { margin: 0; font-size: 13px; color: #92400e; }
                    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; }
                    .footer p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.8; }
                    .footer strong { color: #64748b; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="header-icon">⚖️</div>
                            <h1>CaseXpert</h1>
                            <p>Legal Assistance Platform</p>
                        </div>
                        <div class="body">
                            <p class="greeting">Hello <strong>${userName}</strong>,</p>
                            <p style="color:#475569; font-size:15px; margin:0 0 20px;">
                                Thank you for registering with CaseXpert. To complete your account setup, please use the verification code below.
                            </p>

                            <p class="otp-label">Your verification code</p>
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                                <p class="otp-expiry">⏱ This code expires in <strong>10 minutes</strong></p>
                            </div>

                            <div class="info-box">
                                <p>⚠️ <strong>Never share this code</strong> with anyone. CaseXpert will never ask for your OTP via phone or chat.</p>
                            </div>

                            <div class="divider"></div>
                            <p style="color:#94a3b8; font-size:13px; margin:0;">
                                If you did not request this verification, you can safely ignore this email. Your account will not be created without entering this code.
                            </p>
                        </div>
                        <div class="footer">
                            <p>
                                &copy; ${new Date().getFullYear()} <strong>CaseXpert Platform</strong>. All rights reserved.<br>
                                This is an automated message — please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const subjectLine = `Your CaseXpert Verification Code: ${otp}`;

        // Attempt to use SendGrid if configured (More reliable on Render)
        if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
            console.log(`📤 Using SendGrid to send OTP to ${userEmail}...`);
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: userEmail,
                from: {
                    name: fromName,
                    email: process.env.SENDGRID_FROM_EMAIL || fromEmail
                },
                subject: subjectLine,
                html: htmlContent,
            };
            await sgMail.send(msg);
            console.log(`✅ OTP email sent via SendGrid to ${userEmail}`);
            return { success: true, provider: 'sendgrid' };
        }

        // Fallback to Nodemailer (Gmail SMTP)
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: userEmail,
            subject: subjectLine,
            html: htmlContent
        };

        console.log(`📤 Attempting to send OTP email via Gmail SMTP to ${userEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent via Gmail to ${userEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId, provider: 'gmail' };
    } catch (error) {
        console.error('❌ OTP email failed:', error);
        return { success: false, error: error.message };
    }
};

// ============================================================
// SEND CASE UPDATE EMAIL — Existing functionality
// ============================================================
exports.sendCaseUpdateEmail = async ({
    userName,
    userEmail,
    caseId,
    caseTitle,
    newStatus,
    updateMessage,
    updateDate = new Date().toLocaleString()
}) => {
    try {
        const fromName = process.env.FROM_NAME || 'CaseXpert Legal Support';
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: userEmail,
            subject: `Case Update Notification – CaseXpert (ID: ${caseId})`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
                        .header { background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; }
                        .details { background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
                        .status-badge { display: inline-block; padding: 5px 12px; border-radius: 15px; background-color: #3b82f6; color: white; font-weight: bold; font-size: 0.8em; text-transform: uppercase; }
                        .footer { font-size: 0.8em; color: #64748b; text-align: center; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 10px; }
                        .cta-button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header"><h2>CaseXpert Notification</h2></div>
                        <div class="content">
                            <p>Hello <strong>${userName}</strong>,</p>
                            <p>Your case <strong>"${caseTitle}"</strong> has been updated.</p>
                            <div class="details">
                                <p><strong>Case ID:</strong> #${caseId}</p>
                                <p><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
                                <p><strong>Update:</strong> ${updateMessage || 'No specific update message.'}</p>
                                <p><strong>Date:</strong> ${updateDate}</p>
                            </div>
                            <div style="text-align:center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cases/${caseId}" class="cta-button">View Case Details</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} CaseXpert Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Case update email sent for #${caseId}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Case update email failed:', error);
        return { success: false, error: error.message };
    }
};

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================
exports.sendPasswordResetEmail = async ({ userEmail, userName, resetUrl }) => {
    try {
        const fromName = process.env.FROM_NAME || 'CaseXpert Support';
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 40px auto; padding: 40px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #1e3a8a; margin: 0; }
                    .content { margin-bottom: 30px; }
                    .cta-button { display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; }
                    .footer { font-size: 0.8em; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header"><h1>CaseXpert</h1></div>
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>You requested to reset your password. Please click the button below to set a new one. This link will expire in 30 minutes.</p>
                        <div style="text-align:center; margin: 30px 0;">
                            <a href="${resetUrl}" class="cta-button">Reset My Password</a>
                        </div>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} CaseXpert Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: userEmail,
            subject: 'Password Reset Request - CaseXpert',
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${userEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Password reset email failed:', error);
        return { success: false, error: error.message };
    }
};
