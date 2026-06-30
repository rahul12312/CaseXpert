const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');

async function checkConfirmed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const confirmed = await Booking.find({ status: 'confirmed' })
            .populate('user', 'name')
            .populate({ path: 'lawyer', populate: { path: 'user', select: 'name' } });
            
        console.log(`\n📊 Confirmed Bookings found: ${confirmed.length}`);
        
        confirmed.forEach(b => {
            console.log(`- ID: ${b._id}`);
            console.log(`  User: ${b.user?.name}`);
            console.log(`  Lawyer: ${b.lawyer?.user?.name}`);
            console.log(`  Type: ${b.booking_type}`);
            console.log(`  Time: ${b.booking_time}`);
            console.log('-------------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkConfirmed();
