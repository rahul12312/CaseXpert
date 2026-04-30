import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

// ============================================================================
// Email Service - EmailJS Integration
// ============================================================================

/**
 * Configuration placeholders - Replace with actual credentials from EmailJS dashboard
 */
const EMAILJS_SERVICE_ID = 'service_casexpert'; // Placeholder
const EMAILJS_TEMPLATE_ID = 'template_case_update'; // Placeholder
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Placeholder

/**
 * Send case update notification email via EmailJS
 * 
 * @param {string} userEmail - Recipient email
 * @param {string} userName - Client name
 * @param {string} caseId - Case ID
 * @param {string} caseTitle - Title of the case
 * @param {string} status - New case status
 * @param {string} message - lawyer/admin update message
 */
export const sendCaseUpdateEmail = async (userEmail, userName, caseId, caseTitle, status, message) => {
    try {
        console.log('📧 Sending EmailJS notification...', { userEmail, userName, caseId, status });

        const templateParams = {
            user_name: userName,
            user_email: userEmail,
            case_id: caseId,
            case_title: caseTitle,
            case_status: status,
            message: message || `Your case status has been updated to ${status}.`,
            date: new Date().toLocaleString(),
            login_url: window.location.origin + '/login'
        };

        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        if (result.status === 200) {
            console.log('✅ Email sent successfully:', result.text);
            toast.success(`Email sent successfully to ${userName}`);
            return { success: true, result };
        } else {
            throw new Error(`EmailJS responded with status ${result.status}`);
        }
    } catch (error) {
        console.error('❌ EmailJS notification failed:', error);
        toast.error('Failed to send email notification.');
        return { success: false, error: error.message };
    }
};

export default {
    sendCaseUpdateEmail
};
