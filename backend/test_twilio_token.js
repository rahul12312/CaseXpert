const twilio = require('twilio');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load .env - try local first, then backend/
const envPath = fs.existsSync('.env') ? '.env' : path.join(__dirname, 'backend', '.env');
dotenv.config({ path: envPath });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

console.log('--- Twilio Config Check ---');
console.log('Account SID:', accountSid ? 'FOUND' : 'MISSING');
console.log('API Key:', apiKey ? 'FOUND' : 'MISSING');
console.log('API Secret:', apiSecret ? 'FOUND' : 'MISSING');

if (!accountSid || !apiKey || !apiSecret) {
    console.error('❌ Missing Twilio credentials in backend/.env');
    process.exit(1);
}

try {
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
        accountSid,
        apiKey,
        apiSecret,
        { identity: 'test_user_identity' }
    );

    const videoGrant = new VideoGrant({ room: 'test_room' });
    token.addGrant(videoGrant);

    const jwt = token.toJwt();
    console.log('\n✅ Token generated successfully!');
    
    // Decode and log payload
    const base64Payload = jwt.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    console.log('\n--- Decoded Token Payload ---');
    console.log('Account SID (iss):', payload.iss);
    console.log('API Key (sub):', payload.sub);
    console.log('Identity (grants.identity):', payload.grants?.identity);
    console.log('Room (grants.video.room):', payload.grants?.video?.room);
    
    console.log('\n--- Next Steps ---');
    console.log('1. If the token fails in the browser, check if you have a Twilio Trial account.');
    console.log('2. Ensure the API Key (SK...) was created in the SAME account as the SID.');
} catch (error) {
    console.error('\n❌ Token generation failed:', error.message);
}
