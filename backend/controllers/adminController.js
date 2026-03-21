const { getDatabase } = require("../config/database");

// Helper function to get database connection
const getDb = () => {
    return getDatabase();
};

// ============================================================================
// GET ALL LAWYERS (ADMIN VIEW)
// ============================================================================
exports.getAllLawyersAdmin = async (req, res) => {
    try {
        const database = getDb();
        if (!database) {
            return res.status(500).json({ success: false, message: "Database connection not available" });
        }

        // Fetch lawyers with user details and status
        const [lawyers] = await database.query(`
            SELECT 
                l.id, l.user_id, l.specialization, l.experience, l.verification_status, l.created_at,
                u.name, u.email, u.phone, u.profile_image
            FROM lawyers l
            JOIN users u ON l.user_id = u.id
            ORDER BY 
                CASE WHEN l.verification_status = 'PENDING_VERIFICATION' THEN 1 ELSE 2 END,
                l.created_at DESC
        `);

        return res.json({
            success: true,
            lawyers
        });

    } catch (error) {
        console.error("Admin fetch lawyers error:", error);
        return res.status(500).json({ success: false, message: "Error fetching lawyers", error: error.message });
    }
};

const s3Service = require("../services/s3Service");

// ============================================================================
// GET LAWYER DETAILS (ADMIN VIEW)
// ============================================================================
// ============================================================================
// GET LAWYER DETAILS (ADMIN VIEW)
// ============================================================================
exports.getLawyerDetails = async (req, res) => {
    console.log(`🔵 getLawyerDetails called for ID: ${req.params.id}`);
    try {
        const { id } = req.params; // This is the LAWYER ID, not user_id

        // 1. Validation
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ success: false, message: "Invalid lawyer ID provided" });
        }

        const database = getDb();
        if (!database) {
            console.error("❌ Database connection failed in admin controller");
            return res.status(500).json({ success: false, message: "Database connection not available" });
        }

        // 2. Fetch lawyer + user details
        // Note: Removed bio, rating, review_count, consultation_fee to prevent 500 errors if columns are missing
        const [lawyers] = await database.query(`
            SELECT 
                l.id, l.user_id, l.specialization, l.experience, l.languages, l.verification_status, l.created_at,
                u.name, u.email, u.phone, u.profile_image, u.is_verified, u.user_type
            FROM lawyers l
            JOIN users u ON l.user_id = u.id
            WHERE l.id = ?
        `, [id]);

        if (!lawyers || lawyers.length === 0) {
            console.warn(`⚠️ Lawyer not found for ID: ${id}`);
            return res.status(404).json({ success: false, message: "Lawyer not found" });
        }

        const lawyer = lawyers[0];

        // 3. Fetch uploaded documents - Handle missing user_id gracefully
        let docsWithUrls = [];

        if (lawyer.user_id) {
            try {
                const [documents] = await database.query(`
                    SELECT id, title, document_type, file_type, file_size, s3_key, created_at 
                    FROM user_documents 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC
                `, [lawyer.user_id]);

                // Generate presigned URLs securely
                docsWithUrls = await Promise.all(documents.map(async (doc) => {
                    let url = null;
                    if (doc.s3_key) {
                        try {
                            url = await s3Service.getPresignedDownloadUrl(doc.s3_key, 3600);
                        } catch (e) {
                            console.warn(`⚠️ Failed to sign url for doc ${doc.id}:`, e.message);
                        }
                    }
                    return { ...doc, url };
                }));
            } catch (docError) {
                console.error("⚠️ Error fetching documents (non-fatal):", docError.message);
                // We don't fail the request if documents fail to load
            }
        }

        // 4. Return combined data
        console.log(`✅ Successfully fetched details for lawyer ${lawyer.id}`);
        return res.json({
            success: true,
            lawyer: {
                ...lawyer,
                documents: docsWithUrls
            }
        });

    } catch (error) {
        console.error("❌ Admin fetch lawyer details CRITICAL error:", error);
        return res.status(500).json({ success: false, message: "Internal server error fetching lawyer details" });
    }
};


// ============================================================================
// GET DASHBOARD STATS
// ============================================================================
exports.getDashboardStats = async (req, res) => {
    try {
        const database = getDb();
        if (!database) {
            return res.status(500).json({ success: false, message: "Database not available" });
        }

        // Lawyer Counts
        const [totalLawyers] = await database.query("SELECT COUNT(*) as count FROM lawyers");
        const [verifiedLawyers] = await database.query("SELECT COUNT(*) as count FROM lawyers WHERE verification_status = 'VERIFIED'");
        const [pendingLawyers] = await database.query("SELECT COUNT(*) as count FROM lawyers WHERE verification_status = 'PENDING_VERIFICATION'");
        const [rejectedLawyers] = await database.query("SELECT COUNT(*) as count FROM lawyers WHERE verification_status = 'REJECTED'");

        // Case Counts
        const [totalCases] = await database.query("SELECT COUNT(*) as count FROM cases");
        const [pendingCases] = await database.query("SELECT COUNT(*) as count FROM cases WHERE status = 'pending'");
        const [activeCases] = await database.query("SELECT COUNT(*) as count FROM cases WHERE status IN ('assigned', 'in_progress', 'on_hold')");

        // Consultation Counts
        const [totalConsultations] = await database.query("SELECT COUNT(*) as count FROM bookings");
        const [pendingConsultations] = await database.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
        const [confirmedConsultations] = await database.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");

        // Grouped Cases
        const [groupedCases] = await database.query(`
            SELECT u.name as lawyer_name, COUNT(c.id) as case_count, l.specialization
            FROM cases c
            JOIN lawyers l ON c.lawyer_id = l.id
            JOIN users u ON l.user_id = u.id
            GROUP BY l.id
            ORDER BY case_count DESC
            LIMIT 5
        `);

        return res.json({
            success: true,
            stats: {
                lawyers: {
                    total: totalLawyers[0].count,
                    verified: verifiedLawyers[0].count,
                    pending: pendingLawyers[0].count,
                    rejected: rejectedLawyers[0].count
                },
                cases: {
                    total: totalCases[0].count,
                    pending: pendingCases[0].count,
                    active: activeCases[0].count
                },
                consultations: {
                    total: totalConsultations[0].count,
                    pending: pendingConsultations[0].count,
                    confirmed: confirmedConsultations[0].count
                },
                topLawyers: groupedCases
            }
        });

    } catch (error) {
        console.error("Stats error:", error);
        return res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

// ============================================================================
// GET ALL CASES (ADMIN)
// ============================================================================
exports.getAllCasesAdmin = async (req, res) => {
    try {
        const database = getDb();

        const [cases] = await database.query(`
            SELECT 
                c.id, c.case_number, c.title, c.status, c.created_at,
                u.name as client_name,
                lawyer_user.name as lawyer_name
            FROM cases c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN lawyers l ON c.lawyer_id = l.id
            LEFT JOIN users lawyer_user ON l.user_id = lawyer_user.id
            ORDER BY c.created_at DESC
        `);

        return res.json({ success: true, cases });
    } catch (error) {
        console.error("Cases error:", error);
        return res.status(500).json({ success: false, message: "Error fetching cases" });
    }
};

// ============================================================================
// VERIFY LAWYER
// ============================================================================
exports.verifyLawyer = async (req, res) => {
    try {
        const { id } = req.params; // lawyer ID
        const database = getDb();

        const [result] = await database.query(
            "UPDATE lawyers SET verification_status = 'VERIFIED' WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Lawyer not found" });
        }

        return res.json({ success: true, message: "Lawyer verified successfully" });

    } catch (error) {
        console.error("Verify lawyer error:", error);
        return res.status(500).json({ success: false, message: "Error verifying lawyer", error: error.message });
    }
};

// ============================================================================
// REJECT LAWYER
// ============================================================================
exports.rejectLawyer = async (req, res) => {
    try {
        const { id } = req.params;
        const database = getDb();

        const [result] = await database.query(
            "UPDATE lawyers SET verification_status = 'REJECTED' WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Lawyer not found" });
        }

        return res.json({ success: true, message: "Lawyer rejected" });

    } catch (error) {
        console.error("Reject lawyer error:", error);
        return res.status(500).json({ success: false, message: "Error rejecting lawyer", error: error.message });
    }
};
