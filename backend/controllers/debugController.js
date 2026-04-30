const twilioConfig = require('../config/twilio');

exports.checkTwilioConfig = (req, res) => {
    const config = {
        accountSidSet: !!twilioConfig.accountSid,
        authTokenSet: !!twilioConfig.authToken,
        apiKeySet: !!twilioConfig.apiKey,
        apiSecretSet: !!twilioConfig.apiSecret,
        accountSidPrefix: twilioConfig.accountSid ? twilioConfig.accountSid.substring(0, 4) : 'MISSING'
    };
    
    const isComplete = config.accountSidSet && config.authTokenSet && config.apiKeySet && config.apiSecretSet;
    
    return res.json({
        success: isComplete,
        message: isComplete ? "Twilio is configured" : "Twilio configuration is incomplete on Render",
        config
    });
};
