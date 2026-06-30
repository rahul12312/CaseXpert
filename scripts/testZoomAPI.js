require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

async function testZoom() {
    try {
        const accountId = process.env.ZOOM_ACCOUNT_ID;
        const clientId = process.env.ZOOM_SDK_KEY;
        const clientSecret = process.env.ZOOM_SDK_SECRET;

        console.log(`Using Account ID: ${accountId}`);

        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
            {},
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                },
            }
        );

        console.log('✅ Access Token acquired successfully.');
        const token = response.data.access_token;

        const meetingResponse = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic: "Test CaseXpert Meeting",
                type: 1
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('✅ Meeting created successfully!');
        console.log(`Meeting ID: ${meetingResponse.data.id}`);
        console.log(`Join URL: ${meetingResponse.data.join_url}`);
        
    } catch (error) {
        console.error('❌ Zoom API Test Error:', error.response ? error.response.data : error.message);
    }
}

testZoom();
