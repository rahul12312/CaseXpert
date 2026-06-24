const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio (only if real credentials are provided - SID must start with "AC")
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const isTwilioConfigured = twilioAccountSid && twilioAuthToken &&
    twilioAccountSid.startsWith('AC') && twilioAuthToken.length > 10;
const twilioClient = isTwilioConfigured
    ? twilio(twilioAccountSid, twilioAuthToken)
    : null;

/**
 * Notification Service - Centralized SMS and Email notifications
 */
const notificationService = {
    /**
     * Send SMS Notification via Twilio
     */
    sendSMSNotification: async ({ to, caseId, status, message }) => {
        try {
            if (!twilioClient) {
                console.warn('⚠️ Twilio client not initialized. Check .env variables.');
                return { success: false, error: 'Twilio not configured' };
            }

            const body = `CaseXpert Update\nCase ID: ${caseId}\nStatus: ${status}\nMessage: ${message || 'Updated'}\n\nCheck your dashboard for details.`;

            const result = await twilioClient.messages.create({
                body: body,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });

            console.log(`✅ SMS sent to ${to}: ${result.sid}`);
            return { success: true, sid: result.sid };
        } catch (error) {
            console.error('❌ Twilio SMS failed:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send Email Notification via SendGrid
     */
    sendEmailNotification: async ({ to, userName, caseId, caseTitle, status, message }) => {
        try {
            if (!process.env.SENDGRID_API_KEY) {
                console.warn('⚠️ SendGrid API Key not found. Check .env.');
                return { success: false, error: 'SendGrid not configured' };
            }

            const msg = {
                to: to,
                from: process.env.SENDGRID_FROM_EMAIL || 'notifications@casexpert.com',
                subject: `Case Update – CaseXpert (ID: ${caseId})`,
                text: `Hello ${userName},\n\nYour case "${caseTitle}" has been updated.\n\nCase ID: ${caseId}\nNew Status: ${status}\n\nMessage:\n${message || 'Your case has been updated.'}\n\nDate: ${new Date().toLocaleString()}\n\nLogin to CaseXpert to track your case.`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                        <h2 style="color: #1a365d;">Case Update Notification</h2>
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Your case "<strong>${caseTitle}</strong>" has been updated in the CaseXpert system.</p>
                        <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; border-left: 5px solid #3182ce; margin: 20px 0;">
                            <p><strong>Case ID:</strong> #${caseId}</p>
                            <p><strong>New Status:</strong> <span style="color: #2b6cb0; font-weight: bold;">${status}</span></p>
                            <p><strong>Update Message:</strong> ${message || 'The status has been updated by the legal team.'}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>You can track your case anytime on the <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cases/${caseId}">CaseXpert Dashboard</a>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #718096;">&copy; ${new Date().getFullYear()} CaseXpert Legal Support Team. This is an automated message.</p>
                    </div>
                `,
            };

            await sgMail.send(msg);
            console.log(`✅ SendGrid Email sent to ${to}`);
            return { success: true };
        } catch (error) {
            console.error('❌ SendGrid Email failed:', error.response ? error.response.body : error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Unified notification - Trigger both SMS and Email
     */
    triggerUpdateNotifications: async (caseData, newStatus, message) => {
        const results = { sms: null, email: null };

        // 1. Send Email if address exists
        if (caseData.user_email) {
            results.email = await notificationService.sendEmailNotification({
                to: caseData.user_email,
                userName: caseData.user_name || 'User',
                caseId: caseData.id,
                caseTitle: caseData.title,
                status: newStatus,
                message: message
            });
        }

        // 2. Send SMS if phone exists
        if (caseData.user_phone) {
            results.sms = await notificationService.sendSMSNotification({
                to: caseData.user_phone,
                caseId: caseData.id,
                status: newStatus,
                message: message
            });
        }

        return results;
    }
};

module.exports = notificationService;
