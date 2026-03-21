const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_EMAIL || process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
});

/**
 * Send Professional legal notification email
 */
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
        const fromEmail = process.env.FROM_EMAIL || 'noreply@casexpert.com';

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
                        <div class="header">
                            <h2>CaseXpert Notification</h2>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${userName}</strong>,</p>
                            <p>This is an automated notification from <strong>CaseXpert Legal Support</strong> regarding your ongoing case.</p>
                            
                            <p>Your case <strong>"${caseTitle}"</strong> has been updated with a new status.</p>
                            
                            <div class="details">
                                <p><strong>Case ID:</strong> #${caseId}</p>
                                <p><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
                                <p><strong>Update Message:</strong> ${updateMessage || 'No specific update message provided by the legal team.'}</p>
                                <p><strong>Date of Update:</strong> ${updateDate}</p>
                            </div>
                            
                            <p>Our legal team is actively working on the next steps. You can view all documents, hearing schedules, and detailed progress on your dashboard.</p>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cases/${caseId}" class="cta-button">View Case Details</a>
                            </div>
                            
                            <p>Thank you for choosing CaseXpert.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} CaseXpert Platform. All rights reserved.</p>
                            <p>This is a system-generated email. Please do not reply directly to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent for case #${caseId}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email notification failed:', error);
        return { success: false, error: error.message };
    }
};
