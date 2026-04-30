require('dotenv').config();
const { createZoomMeeting } = require('../utils/zoomAPI');

async function diagnostic() {
    console.log("🔍 [ZOOM DIAGNOSTIC] Starting...");
    console.log("Checking environment variables...");
    
    const vars = ['ZOOM_SDK_KEY', 'ZOOM_SDK_SECRET', 'ZOOM_ACCOUNT_ID'];
    vars.forEach(v => {
        if (!process.env[v]) {
            console.error(`❌ Missing ${v}`);
        } else {
            console.log(`✅ ${v} is set (length: ${process.env[v].length})`);
        }
    });

    try {
        console.log("\n📡 Attempting to create a test meeting...");
        const meeting = await createZoomMeeting("DIAGNOSTIC TEST MEETING", "Testing Server-to-Server OAuth");
        console.log("✅ SUCCESS!");
        console.log("Meeting ID:", meeting.meetingId);
        console.log("Join URL:", meeting.joinUrl);
    } catch (err) {
        console.error("\n❌ FAILED TO CREATE MEETING");
        console.error("Error Detail:", err.message);
        
        if (err.message.includes('401')) {
            console.log("💡 Tip: A 401 error usually means your Client ID or Client Secret is wrong.");
        } else if (err.message.includes('400')) {
            console.log("💡 Tip: A 400 error often means the Account ID is wrong or the user 'me' isn't authorized.");
        }
    }
}

diagnostic();
