const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');

async function diagnoseBookings() {
    console.log('🧪 Diagnosing Bookings...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const bookings = await Booking.find({ status: 'pending' }).limit(5);
        console.log(`\n📊 Pending Bookings found: ${bookings.length}`);

        for (const b of bookings) {
            console.log(`\n--- Booking: ${b.booking_number} ---`);
            console.log(`- Lawyer ID in Booking: ${b.lawyer}`);
            
            // Check if this ID points to a Lawyer profile
            const lawyerProfile = await Lawyer.findById(b.lawyer);
            if (lawyerProfile) {
                console.log(`✅ Pointing to a LAWYER profile: ${lawyerProfile._id}`);
            } else {
                console.log(`❌ NOT a Lawyer profile ID.`);
                
                // Check if it's a User ID instead
                const userProfile = await User.findById(b.lawyer);
                if (userProfile) {
                    console.log(`⚠️  Pointing to a USER profile: ${userProfile.name} (${userProfile.email})`);
                    console.log(`   This is the BUG! It should point to the Lawyer profile.`);
                }
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

diagnoseBookings();
