const twilio = require('twilio');

const twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim(),
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim(),
    apiKey: process.env.TWILIO_API_KEY?.trim(),
    apiSecret: process.env.TWILIO_API_SECRET?.trim()
};

// Log warning if variables are missing
if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.apiKey || !twilioConfig.apiSecret) {
    console.warn('⚠️  Twilio configuration is incomplete. Video consultations may not work.');
}

module.exports = twilioConfig;
