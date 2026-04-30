const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Lawyer = require('../models/Lawyer');
const User = require('../models/User');

async function checkLink() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const lawyerId = '69c405ec04e3175cff51ac58';
        const lawyer = await Lawyer.findById(lawyerId).populate('user');
        
        if (lawyer) {
            console.log(`Lawyer Profile: ${lawyer._id}`);
            console.log(`Belongs to User: ${lawyer.user?.name} (${lawyer.user?.email}) | User ID: ${lawyer.user?._id}`);
        } else {
            console.log('Lawyer profile not found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkLink();
