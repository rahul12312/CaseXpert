const Case = require('../models/Case');
const generateTwilioToken = require('../utils/generateTwilioToken');
const { getDatabase } = require('../config/database');

/**
 * Generate Access Token for Video Consultation
 * POST /api/video/token
 */
exports.getToken = async (req, res) => {
    try {
        const { room, username } = req.body;
        const userId = req.user.id;
        const userRole = req.user.user_type || req.user.role;

        if (!room) {
            return res.status(400).json({ message: 'Room name is required' });
        }

        // Room name format: consultation_<id>
        const id = room.replace('consultation_', '');
        const pool = getDatabase();

        let hasAccess = false;
        let targetIdentity = username || `${userRole}_${userId}`;

        // 1. Check if it's a Booking ID
        const [bookings] = await pool.query(
            'SELECT * FROM bookings WHERE id = ?',
            [id]
        );

        if (bookings.length > 0) {
            const booking = bookings[0];
            // Check access by user_id or lawyer_id (which points to a user)
            // Note: In this schema, lawyer_user_id might be the user_id of the lawyer
            if (userId == booking.user_id) {
                hasAccess = true;
            } else {
                // Check if the lawyer_id matches current user
                // Some schemas use lawyer_id (from lawyers table) or lawyer_user_id (from users table)
                if (booking.lawyer_user_id == userId) {
                    hasAccess = true;
                } else if (booking.lawyer_id) {
                    const [lawyers] = await pool.query('SELECT user_id FROM lawyers WHERE id = ?', [booking.lawyer_id]);
                    if (lawyers.length > 0 && lawyers[0].user_id == userId) {
                        hasAccess = true;
                    }
                }
            }
        }

        // 2. If not a booking or no access yet, check if it's a Case ID
        if (!hasAccess) {
            const caseData = await Case.getById(id);
            if (caseData) {
                if (caseData.user_id == userId) {
                    hasAccess = true;
                } else if (caseData.lawyer_id) {
                    const [lawyers] = await pool.query('SELECT user_id FROM lawyers WHERE id = ?', [caseData.lawyer_id]);
                    if (lawyers.length > 0 && lawyers[0].user_id == userId) {
                        hasAccess = true;
                    }
                }
            }
        }

        if (!hasAccess) {
            console.log(`🚫 Access denied for user ${userId} to room ${room}`);
            return res.status(403).json({ message: 'You do not have access to this consultation room' });
        }

        // Generate token
        const token = generateTwilioToken(targetIdentity, room);
        res.json({ token });

    } catch (error) {
        console.error('Error in getToken:', error);
        res.status(500).json({ message: 'Server error generating token' });
    }
};
