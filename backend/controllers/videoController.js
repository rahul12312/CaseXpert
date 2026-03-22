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

        // Room name format: consultation_B<id> or consultation_C<id>
        const roomId = room.replace('consultation_', '');
        const type = roomId.charAt(0).toUpperCase(); // 'B' or 'C'
        const id = (type === 'B' || type === 'C') ? roomId.substring(1) : roomId;
        
        const pool = getDatabase();

        let hasAccess = false;
        let targetIdentity = (username || `${userRole}_${userId}`).trim();

        // 1. If it's a Booking (B) or no prefix (backward compatibility)
        if (type === 'B' || !['B', 'C'].includes(type)) {
            const [bookings] = await pool.query(
                'SELECT * FROM bookings WHERE id = ?',
                [id]
            );

            console.log(`🔍 Checking booking ${id} for user ${userId} (role: ${userRole})`);

            if (bookings.length > 0) {
                const booking = bookings[0];
                console.log(`📋 Booking found: user_id=${booking.user_id}, lawyer_id=${booking.lawyer_id}, lawyer_user_id=${booking.lawyer_user_id}`);
                
                if (userId == booking.user_id) {
                    console.log('✅ Access granted: user is the booking client');
                    hasAccess = true;
                } else if (booking.lawyer_user_id == userId) {
                    console.log('✅ Access granted: user matches lawyer_user_id directly');
                    hasAccess = true;
                } else if (booking.lawyer_id) {
                    const [lawyers] = await pool.query('SELECT user_id FROM lawyers WHERE id = ?', [booking.lawyer_id]);
                    console.log(`🔍 Lawyer record: id=${booking.lawyer_id}, user_id=${lawyers[0]?.user_id}`);
                    if (lawyers.length > 0 && lawyers[0].user_id == userId) {
                        console.log('✅ Access granted: user matched via lawyers table');
                        hasAccess = true;
                    } else {
                        console.log(`🚫 Lawyer table mismatch: lawyer.user_id=${lawyers[0]?.user_id} vs request userId=${userId}`);
                    }
                }
            } else {
                console.log(`⚠️ No booking found with id=${id}`);
            }
        }

        // 2. If it's a Case (C) or no prefix and not found in bookings
        if (!hasAccess && (type === 'C' || !['B', 'C'].includes(type))) {
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
