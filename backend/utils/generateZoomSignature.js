const jwt = require('jsonwebtoken');

/**
 * Generates a Signature for Zoom Meeting SDK
 * @param {string} meetingNumber - The meeting number
 * @param {number} role - 0 for participant, 1 for host
 * @returns {string} - The JWT signature
 */
const generateZoomSignature = (meetingNumber, role) => {
    const sdkKey = process.env.ZOOM_SDK_KEY?.trim();
    const sdkSecret = process.env.ZOOM_SDK_SECRET?.trim();

    if (!sdkKey || !sdkSecret) {
        console.error('❌ Zoom SDK Key or Secret missing in .env');
        return null;
    }

    // Ensure meeting number is a string and has no spaces
    const sanitizedMeetingNumber = String(meetingNumber).replace(/\s/g, '');

    const iat = Math.floor(Date.now() / 1000) - 60; // 1 minute in the past for safety
    const exp = iat + 60 * 60 * 2; // 2 hours

    const payload = {
        sdkKey: String(sdkKey),
        appKey: String(sdkKey),
        mn: sanitizedMeetingNumber,
        role: Number(role),
        iat: iat,
        exp: exp,
        tokenExp: exp
    };

    return jwt.sign(payload, sdkSecret, { algorithm: 'HS256' });
};

module.exports = { generateZoomSignature };
