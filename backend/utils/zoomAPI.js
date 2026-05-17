const axios = require('axios');

async function getZoomAccessToken() {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom credentials missing in .env');
    }

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

    console.log("🎟️ Zoom Token Scopes: Fetched successfully (Count: " + (response.data.scope ? response.data.scope.split(' ').length : 0) + ")");
    return response.data.access_token;
}

async function createZoomMeeting(topic = "CaseXpert Legal Consultation", agenda = "") {
    try {
        const token = await getZoomAccessToken();

        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic: topic,
                type: 1, // Instant meeting
                agenda: agenda,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    watermark: false,
                    use_pmi: false,
                    approval_type: 2, // No registration required
                    waiting_room: true
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Fetch ZAK token to prevent Web SDK white-screen crash for Hosts
        const zakResponse = await axios.get('https://api.zoom.us/v2/users/me/token?type=zak', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const zakToken = zakResponse.data.token;

        return {
            meetingId: response.data.id.toString(),
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password || '',
            zakToken: zakToken
        };
    } catch (error) {
        const errorData = error.response?.data;
        console.error('❌ Error creating Zoom meeting:', errorData || error.message);
        
        // Extract specific Zoom error message or code
        let message = 'Failed to create Zoom meeting';
        if (errorData) {
            message = `Zoom API Error: ${errorData.message} (Code: ${errorData.code})`;
            if (errorData.code === 128) message = "Zoom Error: User not found or not registered in your Zoom account. Ensure 'Account ID' is correct.";
            if (errorData.code === 200) message = "Zoom Error: User does not have a Meeting license. Set your Zoom app to 'Account-Level'.";
            if (errorData.code === 4700) message = "Zoom Error: Meeting SDK not enabled for this account.";
        } else if (error.request) {
            message = "Zoom Error: No response from Zoom servers. Check your backend Internet connection.";
        }
        
        throw new Error(message);
    }
}

module.exports = { createZoomMeeting };
