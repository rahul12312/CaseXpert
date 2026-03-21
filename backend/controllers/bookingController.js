const { getDatabase } = require('../config/database');

/**
 * atomic booking creation transaction
 */
exports.createBooking = async (req, res) => {
    console.log('➡️ POST /api/bookings/book hit');
    const db = getDatabase();
    if (!db) {
        console.error('❌ Database connection missing in createBooking');
        return res.status(500).json({ success: false, message: 'Database connection not established' });
    }

    let connection;
    try {
        console.log('🔄 Getting connection...');
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { lawyerId, consultationType, date, timeSlot, description } = req.body;
        const userId = req.user.id;

        console.log('📝 Creating Booking:', { userId, lawyerId, type: consultationType, date, timeSlot });

        if (!lawyerId || !date || !timeSlot || !description) {
            throw new Error('Missing required fields');
        }

        const bookingTime = `${date} ${timeSlot}:00`;

        const [existing] = await connection.execute(
            `SELECT id FROM bookings 
             WHERE lawyer_id = ? AND booking_time = ? AND status NOT IN ('cancelled', 'rejected')`,
            [lawyerId, bookingTime]
        );

        if (existing.length > 0) {
            await connection.rollback();
            console.warn('⚠️ Double booking detected');
            return res.status(409).json({
                success: false,
                message: 'This time slot is already booked. Please choose another.'
            });
        }

        const bookingNumber = 'BK' + Date.now() + Math.floor(Math.random() * 1000);

        const [result] = await connection.execute(
            `INSERT INTO bookings 
            (booking_number, user_id, lawyer_id, booking_type, booking_time, notes, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [bookingNumber, userId, lawyerId, consultationType, bookingTime, description]
        );

        const [newBooking] = await connection.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [result.insertId]
        );

        await connection.commit();
        console.log('✅ [DATABASE] Booking Saved Successfully');
        console.log('   → ID:', result.insertId);
        console.log('   → Number:', bookingNumber);
        console.log('   → User:', userId);
        console.log('   → Lawyer:', lawyerId);
        console.log('   → Status: pending (Default)');

        res.status(201).json({
            success: true,
            message: 'Consultation request sent successfully',
            data: newBooking[0],
            booking: newBooking[0],
            bookingId: result.insertId,
            bookingNumber
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Create Booking Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserBookings = async (req, res) => {
    console.log('➡️ GET /api/bookings/user hit');
    const db = getDatabase();
    if (!db) {
        console.error('❌ Database connection missing in getUserBookings');
        return res.status(500).json({ message: 'Database error' });
    }

    try {
        const userId = req.user.id;
        console.log(`🔍 [FETCH] User ${userId} is requesting their bookings...`);

        // Force LEFT JOIN and fix column name: consultation_fee -> fee_per_hour
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                l.id as lawyer_id,
                u.name as lawyer_name,
                u.profile_image as lawyer_image,
                l.specialization,
                l.fee_per_hour as consultation_fee
            FROM bookings b
            LEFT JOIN lawyers l ON b.lawyer_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [userId]);

        console.log(`📊 [FETCH RESULT] Found ${bookings.length} bookings for user ${userId}`);

        // Debug first row if it exists
        if (bookings.length > 0) {
            console.log('   → Example status:', bookings[0].status);
        }

        res.json({
            success: true,
            count: bookings.length,
            bookings,
            data: bookings
        });
    } catch (error) {
        console.error('❌ Get User Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};

exports.getLawyerBookings = async (req, res) => {
    const db = getDatabase();
    if (!db) return res.status(500).json({ message: 'Database error' });

    try {
        const userId = req.user.id;
        const [lawyer] = await db.execute('SELECT id, verification_status FROM lawyers WHERE user_id = ?', [userId]);

        if (lawyer.length === 0) {
            return res.status(403).json({ success: false, message: 'Not a registered lawyer' });
        }

        const lawyerData = lawyer[0];
        const lawyerId = lawyerData.id;

        // Show status in console for debugging
        console.log(`🔍 Lawyer ${lawyerId} status: ${lawyerData.verification_status}`);

        // If not verified, they can still view but we should probably warn/restrict them in the UI
        // For now, let them see their requests so they know they are there.

        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as user_name,
                u.email as user_email,
                u.profile_image as user_image,
                u.phone as user_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.lawyer_id = ?
            ORDER BY 
                CASE 
                    WHEN b.status = 'pending' THEN 1 
                    WHEN b.status = 'confirmed' THEN 2
                    ELSE 3 
                END,
                b.booking_time ASC
        `, [lawyerId]);

        console.log(`✅ Found ${bookings.length} bookings for lawyer ${lawyerId}`);
        res.json({
            success: true,
            count: bookings.length,
            bookings,
            data: bookings
        });
    } catch (error) {
        console.error('Get Lawyer Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking requests'
        });
    }
};

exports.updateBookingStatus = async (req, res) => {
    const db = getDatabase();
    if (!db) return res.status(500).json({ message: 'Database error' });

    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const role = req.user.role || req.user.user_type;

        console.log(`📝 Updating booking ${id} to ${status} by user ${userId} (${role})`);

        let targetStatus = status.toLowerCase();
        if (targetStatus === 'accepted') targetStatus = 'confirmed'; // Map to DB enum

        if (!['confirmed', 'rejected', 'cancelled'].includes(targetStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let query = '';
        let params = [];

        if (role === 'lawyer') {
            const [lawyer] = await db.execute('SELECT id, verification_status FROM lawyers WHERE user_id = ?', [userId]);
            if (!lawyer.length) return res.status(403).json({ message: 'Unauthorized' });

            if (lawyer[0].verification_status !== 'VERIFIED') {
                console.warn(`🛑 Unverified lawyer ${userId} attempted to update booking status`);
                return res.status(403).json({
                    success: false,
                    message: 'Account pending verification. You can only accept consultations after admin approval.',
                    status: lawyer[0].verification_status
                });
            }

            query = `UPDATE bookings SET status = ? WHERE id = ? AND lawyer_id = ? AND status = 'pending'`;
            params = [targetStatus, id, lawyer[0].id];
        } else if (role === 'client' || role === 'user') {
            if (targetStatus !== 'cancelled') {
                return res.status(403).json({ message: 'Users can only cancel bookings' });
            }
            query = `UPDATE bookings SET status = ?, cancelled_by = ?, cancelled_at = NOW() WHERE id = ? AND user_id = ? AND status = 'pending'`;
            params = [targetStatus, userId, id, userId];
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        const [result] = await db.execute(query, params);
        console.log(`✅ Status updated to ${targetStatus} for booking ${id}`);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or not authorized to update.'
            });
        }

        res.json({
            success: true,
            message: `Booking ${status} successfully`
        });

    } catch (error) {
        console.error('Update Booking Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status'
        });
    }
};

exports.getAllBookings = async (req, res) => {
    const db = getDatabase();
    if (!db) return res.status(500).json({ message: 'Database error' });

    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as user_name,
                lu.name as lawyer_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN lawyers l ON b.lawyer_id = l.id
            JOIN users lu ON l.user_id = lu.id
            ORDER BY b.created_at DESC
        `);

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch all bookings' });
    }
};
exports.acceptBooking = async (req, res) => {
    const db = getDatabase();
    const userId = req.user.id;
    const role = req.user.role || req.user.user_type;
    const { id } = req.params;

    console.log(`[DEBUG] Accept flow started for:`);
    console.log(` - req.user.id: ${userId}`);
    console.log(` - req.user.role: ${role}`);
    console.log(`🚀 [ACCEPT] Lawyer ${userId} attempting to accept booking ${id}`);

    try {
        // 1. Fetch lawyer details and verification status
        const [lawyers] = await db.execute('SELECT id, verification_status FROM lawyers WHERE user_id = ?', [userId]);
        if (!lawyers.length) {
            console.error(`❌ User ${userId} is not a registered lawyer`);
            return res.status(403).json({ success: false, message: 'You are not registered as a lawyer' });
        }

        const lawyer = lawyers[0];
        console.log(`[DEBUG] Lawyer data found:`);
        console.log(` - lawyer.id: ${lawyer.id}`);
        console.log(` - lawyer.verification_status: ${lawyer.verification_status}`);
        console.log(`DEBUG: req.user.role=${role}, lawyer.status=${lawyer.verification_status}, lawyer.id=${lawyer.id}`);

        // 2. Strict Verification check
        if (lawyer.verification_status !== 'VERIFIED') {
            return res.status(403).json({
                success: false,
                message: 'Only verified lawyers can accept consultations',
                currentStatus: lawyer.verification_status
            });
        }

        // 3. Fetch booking & verify ownership
        const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!bookings.length) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        const booking = bookings[0];
        console.log(`[DEBUG] Consultation data fetched:`);
        console.log(` - booking.id: ${booking.id}`);
        console.log(` - booking.lawyer_id: ${booking.lawyer_id}`);
        console.log(` - booking.status: ${booking.status}`);
        console.log(`DEBUG: booking.lawyerId=${booking.lawyer_id}, lawyer.id=${lawyer.id}`);

        if (parseInt(booking.lawyer_id) !== parseInt(lawyer.id)) {
            console.error(`❌ Ownership Mismatch: Booking ${id} belongs to lawyer ${booking.lawyer_id}, not ${lawyer.id}`);
            return res.status(403).json({ success: false, message: 'You are not assigned to this consultation' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Consultation is already ${booking.status}` });
        }

        // 4. Update status
        await db.execute('UPDATE bookings SET status = "confirmed" WHERE id = ?', [id]);

        console.log(`✅ Booking ${id} successfully accepted by Lawyer ${userId}`);
        res.json({ success: true, message: 'Consultation accepted successfully' });

    } catch (error) {
        console.error('❌ Accept Booking Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.rejectBooking = async (req, res) => {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`🚀 [REJECT] Lawyer ${userId} attempting to reject booking ${id}`);

    try {
        const [lawyers] = await db.execute('SELECT id, verification_status FROM lawyers WHERE user_id = ?', [userId]);
        if (!lawyers.length) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const lawyer = lawyers[0];

        const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!bookings.length) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (parseInt(bookings[0].lawyer_id) !== parseInt(lawyer.id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await db.execute('UPDATE bookings SET status = "rejected" WHERE id = ?', [id]);

        console.log(`✅ Booking ${id} successfully rejected by Lawyer ${userId}`);
        res.json({ success: true, message: 'Consultation rejected' });

    } catch (error) {
        console.error('❌ Reject Booking Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getBookingById = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const userId = Number(req.user.id);

    try {
        console.log(`\n🔍 Fetching Booking ${id} for User ${userId}`);
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as user_name,
                lu.name as lawyer_name,
                lu.profile_image as lawyer_image,
                l.user_id as lawyer_user_id,
                l.specialization
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN lawyers l ON b.lawyer_id = l.id
            JOIN users lu ON l.user_id = lu.id
            WHERE b.id = ?
        `, [id]);

        if (!bookings.length) {
            console.warn(`⚠️ Booking ${id} not found`);
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        const booking = bookings[0];
        const participantId = Number(booking.user_id);
        const lawyerUserId = Number(booking.lawyer_user_id);

        console.log(`🔒 Access Check: User ${userId} vs Participant ${participantId} vs LawyerUser ${lawyerUserId}`);

        // Security: Only user or lawyer can access
        if (participantId !== userId && lawyerUserId !== userId) {
            console.error(`❌ Access Denied: User ${userId} is neither client ${participantId} nor lawyer ${lawyerUserId}`);
            return res.status(403).json({ success: false, message: 'You are not authorized for this consultation' });
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error('❌ Get Booking By ID Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.endConsultation = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { duration } = req.body;
    const userId = Number(req.user.id);

    console.log(`🏁 [END] Attempting to complete consultation ${id} by User ${userId}`);

    try {
        const [lawyers] = await db.execute('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
        if (!lawyers.length) {
            return res.status(403).json({ success: false, message: 'Only lawyers can complete consultations' });
        }
        const lawyerId = Number(lawyers[0].id);

        const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!bookings.length) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        const booking = bookings[0];
        if (Number(booking.lawyer_id) !== lawyerId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: This is not your consultation' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: `Cannot complete a consultation that is ${booking.status}. It must be confirmed first.`
            });
        }

        // Close meeting if open
        await db.execute('UPDATE consultation_meetings SET status = "ENDED" WHERE booking_id = ?', [id]);

        await db.execute(
            'UPDATE bookings SET status = "completed", duration = ?, completed_at = NOW() WHERE id = ?',
            [duration || 60, id]
        );

        console.log(`✅ Consultation ${id} completed successfully`);
        res.json({ success: true, message: 'Consultation marked as completed' });

    } catch (error) {
        console.error('End Consultation Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get meeting status
 */
exports.getMeetingStatus = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    try {
        const [meetings] = await db.execute('SELECT status, meeting_id FROM consultation_meetings WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1', [id]);

        if (meetings.length === 0) {
            return res.json({ success: true, status: 'NOT_CREATED' });
        }

        res.json({ success: true, status: meetings[0].status, meeting_id: meetings[0].meeting_id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Start meeting (Lawyer only)
 */
exports.startMeeting = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const userId = Number(req.user.id);

    try {
        console.log(`🚀 Start Meeting request for Booking ${id} by Host ${userId}`);

        // 1. Get lawyer ID for this user
        const [lawyers] = await db.execute('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
        if (!lawyers.length) return res.status(403).json({ success: false, message: 'Unauthorized: User is not a lawyer' });
        const lawyerId = Number(lawyers[0].id);

        // 2. Verify booking belongs to this lawyer
        const [bookings] = await db.execute('SELECT user_id, lawyer_id, status FROM bookings WHERE id = ?', [id]);
        if (!bookings.length) return res.status(404).json({ success: false, message: 'Consultation not found' });

        const booking = bookings[0];
        if (Number(booking.lawyer_id) !== lawyerId) {
            return res.status(403).json({ success: false, message: 'This consultation is assigned to another lawyer' });
        }

        // Logic check: Status must be confirmed
        if (booking.status !== 'confirmed' && booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Consultation must be confirmed to start' });
        }

        const meetingId = `MEET-${id}-${Date.now()}`;

        // 3. Upsert meeting record
        await db.execute(
            `INSERT INTO consultation_meetings (booking_id, meeting_id, host_id, participant_id, status) 
             VALUES (?, ?, ?, ?, 'HOST_JOINED')
             ON DUPLICATE KEY UPDATE status = 'HOST_JOINED'`,
            [id, meetingId, userId, booking.user_id]
        );

        res.json({ success: true, meeting_id: meetingId, status: 'HOST_JOINED' });
    } catch (error) {
        console.error('❌ Start Meeting Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Request to join meeting (User)
 */
exports.joinMeeting = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const userId = Number(req.user.id);

    try {
        console.log(`👤 Join request for Booking ${id} by User ${userId}`);
        const [meetings] = await db.execute('SELECT status, host_id, participant_id FROM consultation_meetings WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1', [id]);

        if (!meetings.length) return res.status(404).json({ success: false, message: 'Meeting not yet created by lawyer' });

        const meeting = meetings[0];
        const hostId = Number(meeting.host_id);
        const participantId = Number(meeting.participant_id);

        if (participantId !== userId && hostId !== userId) {
            console.error(`❌ Join Refused: User ${userId} is restricted to Host ${hostId} or Participant ${participantId}`);
            return res.status(403).json({ success: false, message: 'You are not authorized for this meeting' });
        }

        // If host joins, already handled via startMeeting, but for robustness:
        if (hostId === userId) {
            return res.json({ success: true, status: meeting.status });
        }

        // If participant joins, update status to WAITING_FOR_APPROVAL
        if (meeting.status === 'HOST_JOINED') {
            await db.execute('UPDATE consultation_meetings SET status = "WAITING_FOR_APPROVAL" WHERE booking_id = ?', [id]);
            return res.json({ success: true, status: 'WAITING_FOR_APPROVAL' });
        }

        res.json({ success: true, status: meeting.status });
    } catch (error) {
        console.error('❌ Join Meeting Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Approve participant (Lawyer)
 */
exports.approveParticipant = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    try {
        await db.execute('UPDATE consultation_meetings SET status = "ACTIVE" WHERE booking_id = ?', [id]);
        res.json({ success: true, status: 'ACTIVE' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Reject participant (Lawyer)
 */
exports.rejectParticipant = async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    try {
        await db.execute('UPDATE consultation_meetings SET status = "ENDED" WHERE booking_id = ?', [id]);
        res.json({ success: true, status: 'ENDED' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
