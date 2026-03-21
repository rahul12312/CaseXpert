const twilio = require('twilio');

const twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET
};

// Log warning if variables are missing
if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.apiKey || !twilioConfig.apiSecret) {
    console.warn('⚠️  Twilio configuration is incomplete. Video consultations may not work.');
}

module.exports = twilioConfig;
