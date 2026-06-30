const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');

async function inspectPending() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const bookings = await Booking.find({ status: 'pending' }).populate('lawyer').populate('user');
        console.log(`Found ${bookings.length} pending bookings.`);

        bookings.forEach(b => {
            console.log('\n--- Booking Detail ---');
            console.log(`ID: ${b._id}`);
            console.log(`Number: ${b.booking_number}`);
            console.log(`Type: ${b.booking_type}`);
            console.log(`Lawyer (ID in DB): ${b.lawyer?._id}`);
            console.log(`Lawyer Name: ${b.lawyer?.user?.name || 'N/A'}`);
            console.log(`User ID: ${b.user?._id}`);
            console.log(`User Name: ${b.user?.name}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

inspectPending();
