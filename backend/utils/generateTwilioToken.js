const twilio = require('twilio');
const twilioConfig = require('../config/twilio');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

/**
 * Generates a Twilio Video Access Token
 * @param {string} identity - Unique identity for the user (username or user ID)
 * @param {string} room - Room name/ID for the consultation
 * @returns {string} - Generated JWT token
 */
const generateTwilioToken = (identity, room) => {
    // Check if configuration is available
    if (!twilioConfig.accountSid || !twilioConfig.apiKey || !twilioConfig.apiSecret) {
        throw new Error('Twilio credentials are not configured');
    }

    // Create an access token which we will sign and return to the client
    const token = new AccessToken(
        twilioConfig.accountSid,
        twilioConfig.apiKey,
        twilioConfig.apiSecret,
        { identity: identity }
    );

    // Create a Video grant which enables a client to use Video 
    // and specify the Room name we want to allow the client to join
    const videoGrant = new VideoGrant({
        room: room
    });

    // Add the grant to the token
    token.addGrant(videoGrant);

    // Serialize the token to a JWT string
    return token.toJwt();
};

module.exports = generateTwilioToken;
