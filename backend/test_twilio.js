require('dotenv').config();
const generateTwilioToken = require('./utils/generateTwilioToken');

try {
    const token1 = generateTwilioToken('Lawyer1', 'consultation_4');
    const token2 = generateTwilioToken('Client1', 'consultation_4');
    console.log("Token 1 length:", token1.length);
    console.log("Token 2 length:", token2.length);
    console.log("Base64 Header 1:", Buffer.from(token1.split('.')[0], 'base64').toString());
    console.log("Base64 Payload 1:", Buffer.from(token1.split('.')[1], 'base64').toString());
    console.log("Base64 Payload 2:", Buffer.from(token2.split('.')[1], 'base64').toString());
} catch (e) {
    console.error("Error generating tokens:", e);
}
