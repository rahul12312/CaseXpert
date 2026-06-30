const express = require("express");
const router = express.Router();
const {
    getAllLawyersAdmin,
    verifyLawyer,
    rejectLawyer,
    getDashboardStats,
    getAllCasesAdmin,
    getLawyerDetails,
    getAllAppointmentsAdmin,
    getAllClientsAdmin
} = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/auth");

// Protect all admin routes
router.use(verifyToken);
router.use(requireRole("admin"));

// Routes
router.get("/dashboard-stats", getDashboardStats);
router.get("/cases", getAllCasesAdmin);
router.get("/lawyers", getAllLawyersAdmin);
router.get("/lawyers/:id", getLawyerDetails);
router.get("/appointments", getAllAppointmentsAdmin);
router.get("/clients", getAllClientsAdmin);
router.put("/lawyers/:id/approve", verifyLawyer);
router.put("/lawyers/:id/reject", rejectLawyer);

module.exports = router;
