const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getLawyerBookings,
    updateBookingStatus,
    getAllBookings,
    acceptBooking,
    rejectBooking,
    getBookingById,
    endConsultation,
    getMeetingStatus,
    startMeeting,
    joinMeeting,
    approveParticipant,
    rejectParticipant
} = require('../controllers/bookingController');
const { verifyToken, isLawyer, isAdmin } = require('../middleware/auth');

// Apply verifyToken to all booking routes
router.use(verifyToken);

// Booking Routes
router.get('/all', isAdmin, getAllBookings);
router.post('/book', createBooking);
router.get('/user', getUserBookings);
router.get('/lawyer', isLawyer, getLawyerBookings);
router.put('/:id/accept', isLawyer, acceptBooking);
router.put('/:id/reject', isLawyer, rejectBooking);
router.put('/:id/status', updateBookingStatus);
// Video Meeting Management
router.get('/:id/meeting/status', getMeetingStatus);
router.post('/:id/meeting/start', isLawyer, startMeeting);
router.post('/:id/meeting/join', joinMeeting);
router.post('/:id/meeting/approve', isLawyer, approveParticipant);
router.post('/:id/meeting/reject', isLawyer, rejectParticipant);

router.get('/:id', getBookingById);
router.post('/:id/end', endConsultation);

module.exports = router;
