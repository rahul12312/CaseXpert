const { getDatabase } = require("../config/database");

// Helper function to get database connection
const getDb = () => {
    return getDatabase();
};

// ============================================================================
// GET LAWYER DASHBOARD STATS
// ============================================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer record
        const [lawyers] = await database.query(
            "SELECT * FROM lawyers WHERE user_id = ?",
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        const lawyer = lawyers[0];

        // Get total active cases assigned to this lawyer
        const [activeCases] = await database.query(
            `SELECT COUNT(*) as count FROM cases 
       WHERE lawyer_id = ? AND status IN ('assigned', 'in_progress')`,
            [lawyer.id]
        );

        // Get total completed cases
        const [completedCases] = await database.query(
            `SELECT COUNT(*) as count FROM cases 
       WHERE lawyer_id = ? AND status IN ('resolved', 'closed')`,
            [lawyer.id]
        );

        // Get pending booking requests
        const [pendingBookings] = await database.query(
            `SELECT COUNT(*) as count FROM bookings 
       WHERE lawyer_id = ? AND status = 'pending'`,
            [lawyer.id]
        );

        // Get today's consultations
        const [todayConsultations] = await database.query(
            `SELECT COUNT(*) as count FROM bookings 
       WHERE lawyer_id = ? 
       AND DATE(booking_time) = CURDATE() 
       AND status IN ('confirmed', 'in_progress')`,
            [lawyer.id]
        );

        return res.json({
            success: true,
            stats: {
                activeCases: activeCases[0].count,
                completedCases: completedCases[0].count,
                pendingRequests: pendingBookings[0].count,
                todayConsultations: todayConsultations[0].count,
                rating: lawyer.rating,
                totalReviews: lawyer.total_reviews,
                totalCasesHandled: lawyer.total_cases_handled,
                successRate: lawyer.success_rate,
                verification_status: lawyer.license_verified === 1 ? 'VERIFIED' : 'PENDING_VERIFICATION'
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching dashboard statistics",
            error: error.message
        });
    }
};

// ============================================================================
// GET CLIENT QUERIES (Cases assigned to lawyer)
// ============================================================================
exports.getClientQueries = async (req, res) => {
    try {
        const userId = req.user.id;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer record
        const [lawyers] = await database.query(
            "SELECT id FROM lawyers WHERE user_id = ?",
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        const lawyerId = lawyers[0].id;

        // Get all cases assigned to this lawyer with client details
        const [cases] = await database.query(
            `SELECT 
        c.id, c.case_number, c.title, c.description, c.case_type, 
        c.priority, c.status, c.next_hearing_date, c.created_at,
        u.id as client_id, u.name as client_name, u.email as client_email, u.phone as client_phone
       FROM cases c
       JOIN users u ON c.user_id = u.id
       WHERE c.lawyer_id = ?
       ORDER BY c.created_at DESC`,
            [lawyerId]
        );

        return res.json({
            success: true,
            queries: cases || []
        });

    } catch (error) {
        console.error("Client queries error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching client queries",
            error: error.message
        });
    }
};

// ============================================================================
// GET CASE REQUESTS (Unassigned or pending assignment cases)
// ============================================================================
exports.getCaseRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer record to check specialization
        const [lawyers] = await database.query(
            "SELECT id, specialization FROM lawyers WHERE user_id = ?",
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        const lawyer = lawyers[0];

        // Get pending/unassigned cases (optionally filter by specialization)
        // For now, showing all pending cases
        const [requests] = await database.query(
            `SELECT 
        c.id, c.case_number, c.title, c.description, c.case_type, 
        c.priority, c.status, c.created_at,
        u.id as client_id, u.name as client_name, u.email as client_email
       FROM cases c
       JOIN users u ON c.user_id = u.id
       WHERE (c.lawyer_id IS NULL AND c.status = 'pending') 
          OR (c.lawyer_id = ? AND (c.assignment_status = 'REQUESTED' OR c.status = 'Under Review'))
       ORDER BY c.priority DESC, c.created_at DESC
       LIMIT 50`,
            [lawyer.id]
        );

        return res.json({
            success: true,
            requests: requests || []
        });

    } catch (error) {
        console.error("Case requests error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching case requests",
            error: error.message
        });
    }
};

// ============================================================================
// ACCEPT CASE REQUEST
// ============================================================================
exports.acceptCaseRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { caseId } = req.params;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer record
        const [lawyers] = await database.query(
            "SELECT id, license_verified FROM lawyers WHERE user_id = ?",
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        const lawyerId = lawyers[0].id;

        // Check verification
        if (lawyers[0].license_verified !== 1) {
            return res.status(403).json({
                success: false,
                message: "You must be VERIFIED to accept cases. Please wait for admin approval."
            });
        }

        // Check if case exists and is either unassigned or specifically assigned to this lawyer
        const [cases] = await database.query(
            "SELECT * FROM cases WHERE id = ? AND (lawyer_id IS NULL OR (lawyer_id = ? AND assignment_status = 'REQUESTED'))",
            [caseId, lawyerId]
        );

        if (!cases || cases.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Case not found, already assigned, or you are not authorized to accept it."
            });
        }

        // Assign case to lawyer and update assignment status
        await database.query(
            "UPDATE cases SET lawyer_id = ?, status = 'assigned', assignment_status = 'ACCEPTED' WHERE id = ?",
            [lawyerId, caseId]
        );

        return res.json({
            success: true,
            message: "Case accepted successfully"
        });

    } catch (error) {
        console.error("Accept case error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error accepting case",
            error: error.message
        });
    }
};

// ============================================================================
// DECLINE CASE REQUEST
// ============================================================================
exports.declineCaseRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { caseId } = req.params;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer record
        const [lawyers] = await database.query(
            "SELECT id FROM lawyers WHERE user_id = ?",
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        const lawyerId = lawyers[0].id;

        // Check if case exists and is requested to this lawyer
        const [cases] = await database.query(
            "SELECT * FROM cases WHERE id = ? AND lawyer_id = ? AND assignment_status = 'REQUESTED'",
            [caseId, lawyerId]
        );

        if (!cases || cases.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Request not found or already processed."
            });
        }

        // Reset case to unassigned so client can assign someone else
        await database.query(
            "UPDATE cases SET lawyer_id = NULL, status = 'pending', assignment_status = 'UNASSIGNED' WHERE id = ?",
            [caseId]
        );

        return res.json({
            success: true,
            message: "Case declined successfully. It is now unassigned."
        });

    } catch (error) {
        console.error("Decline case error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error declining case",
            error: error.message
        });
    }
};

// ============================================================================
// GET LAWYER PROFILE
// ============================================================================
exports.getLawyerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const database = getDb();

        if (!database) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get lawyer profile with user details
        const [lawyers] = await database.query(
            `SELECT 
        l.*, 
        u.name, u.email, u.phone, u.profile_image
       FROM lawyers l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id = ?`,
            [userId]
        );

        if (!lawyers || lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer profile not found"
            });
        }

        return res.json({
            success: true,
            profile: lawyers[0]
        });

    } catch (error) {
        console.error("Lawyer profile error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching lawyer profile",
            error: error.message
        });
    }
};
