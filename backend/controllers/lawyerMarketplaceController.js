// ============================================================================
// LAWYER MARKETPLACE CONTROLLER
// Advanced search, filter, and marketplace functionality
// ============================================================================

const { getDatabase } = require("../config/database");

// ============================================================================
// GET ALL LAWYERS WITH ADVANCED FILTERS
// ============================================================================
exports.getAllLawyers = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        const {
            // Search parameters
            search,
            name,
            city,

            // Filter parameters
            practice_area,
            experience_min,
            experience_max,
            fee_min,
            fee_max,
            language,
            rating,
            verified_only,

            // Sorting
            sort_by,
            sort_order,

            // Pagination
            limit = 20,
            offset = 0
        } = req.query;

        // Build dynamic query matching ACTUAL SCHEMA
        let sql = `
      SELECT 
        l.id,
        l.user_id,
        u.name,
        u.email,
        u.phone,
        u.profile_image,
        l.specialization as practice_areas,
        l.languages,
        l.experience,
        l.consultation_fee,
        l.bio,
        l.city,
        l.state,
        l.license_verified as is_verified,
        l.rating as average_rating,
        l.total_cases,
        l.availability_status
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE u.is_active = 1
    `;

        const params = [];

        // Search filter
        if (search) {
            sql += ` AND (
        u.name LIKE ? OR 
        l.city LIKE ? OR 
        l.bio LIKE ? OR
        l.specialization LIKE ?
      )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Name filter
        if (name) {
            sql += ` AND u.name LIKE ?`;
            params.push(`%${name}%`);
        }

        // City filter
        if (city) {
            sql += ` AND l.city = ?`;
            params.push(city);
        }

        // Practice area filter (exact match on specialization or LIKE)
        if (practice_area) {
            sql += ` AND l.specialization LIKE ?`;
            params.push(`%${practice_area}%`);
        }

        // Experience range filter
        if (experience_min) {
            sql += ` AND l.experience >= ?`;
            params.push(parseInt(experience_min));
        }
        if (experience_max) {
            sql += ` AND l.experience <= ?`;
            params.push(parseInt(experience_max));
        }

        // Fee range filter (consultation_fee)
        if (fee_min !== undefined) {
            sql += ` AND l.consultation_fee >= ?`;
            params.push(parseFloat(fee_min));
        }
        if (fee_max !== undefined) {
            sql += ` AND l.consultation_fee <= ?`;
            params.push(parseFloat(fee_max));
        }

        // Language filter (LIKE match since it's comma separated)
        if (language) {
            sql += ` AND l.languages LIKE ?`;
            params.push(`%${language}%`);
        }

        // Rating filter
        if (rating) {
            sql += ` AND l.rating >= ?`;
            params.push(parseFloat(rating));
        }

        // Verified only filter
        if (verified_only === 'true') {
            sql += ` AND l.license_verified = 1`;
        }

        // Group by not needed as we removed joins
        // sql += ` GROUP BY l.id`;

        // Sorting
        let orderBy = 'l.rating DESC, l.experience DESC';
        if (sort_by === 'rating') {
            orderBy = `l.rating ${sort_order === 'asc' ? 'ASC' : 'DESC'}`;
        } else if (sort_by === 'experience') {
            orderBy = `l.experience ${sort_order === 'asc' ? 'ASC' : 'DESC'}`;
        } else if (sort_by === 'fee_low') {
            orderBy = 'l.consultation_fee ASC';
        } else if (sort_by === 'fee_high') {
            orderBy = 'l.consultation_fee DESC';
        }

        sql += ` ORDER BY ${orderBy}`;

        // Pagination
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        // Execute query
        const [lawyers] = await db.query(sql, params);

        // Get total count for pagination
        let countSql = `
      SELECT COUNT(l.id) as total
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE u.is_active = 1
    `;

        // Apply same filters for count
        const countParams = [];
        if (search) {
            countSql += ` AND (u.name LIKE ? OR l.city LIKE ? OR l.bio LIKE ? OR l.specialization LIKE ?)`;
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (name) {
            countSql += ` AND u.name LIKE ?`;
            countParams.push(`%${name}%`);
        }
        if (city) {
            countSql += ` AND l.city = ?`;
            countParams.push(city);
        }
        if (practice_area) {
            countSql += ` AND l.specialization LIKE ?`;
            countParams.push(`%${practice_area}%`);
        }
        if (experience_min) {
            countSql += ` AND l.experience >= ?`;
            countParams.push(parseInt(experience_min));
        }
        if (experience_max) {
            countSql += ` AND l.experience <= ?`;
            countParams.push(parseInt(experience_max));
        }
        if (fee_min !== undefined) {
            countSql += ` AND l.consultation_fee >= ?`;
            countParams.push(parseFloat(fee_min));
        }
        if (fee_max !== undefined) {
            countSql += ` AND l.consultation_fee <= ?`;
            countParams.push(parseFloat(fee_max));
        }
        if (language) {
            countSql += ` AND l.languages LIKE ?`;
            countParams.push(`%${language}%`);
        }
        if (rating) {
            countSql += ` AND l.rating >= ?`;
            countParams.push(parseFloat(rating));
        }
        if (verified_only === 'true') {
            countSql += ` AND l.license_verified = 1`;
        }

        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: lawyers,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Get lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching lawyers",
            error: error.message
        });
    }
};

// ============================================================================
// GET LAWYER BY ID WITH FULL DETAILS
// ============================================================================
exports.getLawyerById = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        const { id } = req.params;

        // Get lawyer details
        const lawyerSql = `
      SELECT 
        l.*,
        u.name,
        u.email,
        u.phone,
        u.profile_image,
        u.is_verified as user_verified
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.is_active = 1
    `;

        const [lawyers] = await db.query(lawyerSql, [id]);

        if (lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found"
            });
        }

        const lawyer = lawyers[0];

        // Format practice areas from specialization string
        const practiceAreas = lawyer.specialization 
            ? (typeof lawyer.specialization === 'string' ? lawyer.specialization.split(',') : lawyer.specialization).map(area => ({ area_name: area.trim ? area.trim() : area, years_of_experience: lawyer.experience, is_primary: false }))
            : [];

        // Format languages from languages string or JSON array
        const languages = lawyer.languages 
            ? (typeof lawyer.languages === 'string' ? lawyer.languages.split(',') : lawyer.languages).map(lang => ({ language_name: lang.trim ? lang.trim() : lang, proficiency_level: 'Fluent' }))
            : [];

        // Get reviews using the correct column names
        const reviewsSql = `
      SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.is_published as is_verified,
        r.created_at,
        u.name as reviewer_name
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.lawyer_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
        const [reviews] = await db.query(reviewsSql, [id]);

        // Get availability schedule (safe check if table has data)
        const availabilitySql = `
      SELECT day_of_week, start_time, end_time, is_available
      FROM lawyer_availability
      WHERE lawyer_id = ?
      ORDER BY 
        FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `;
        const [availability] = await db.query(availabilitySql, [id]);

        // Combine all data
        const fullProfile = {
            ...lawyer,
            practice_areas: practiceAreas,
            languages: languages,
            reviews: reviews,
            availability: availability || []
        };

        res.json({
            success: true,
            data: fullProfile
        });

    } catch (error) {
        console.error("Get lawyer by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching lawyer details",
            error: error.message
        });
    }
};

// ============================================================================
// GET FILTER OPTIONS (for dynamic filter UI)
// ============================================================================
exports.getFilterOptions = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        // Get unique cities
        const [cities] = await db.query(`
      SELECT DISTINCT city 
      FROM lawyers 
      WHERE city IS NOT NULL AND city != ''
      ORDER BY city
    `);

        // Get unique practice areas (from specialization column)
        const [practiceAreas] = await db.query(`
      SELECT DISTINCT specialization as area_name
      FROM lawyers 
      WHERE specialization IS NOT NULL AND specialization != ''
      ORDER BY specialization
    `);

        // Get unique languages (parse from comma-separated strings)
        const [languageRows] = await db.query(`
      SELECT languages 
      FROM lawyers 
      WHERE languages IS NOT NULL AND languages != ''
    `);

        const uniqueLanguages = new Set();
        languageRows.forEach(row => {
            if (row.languages) {
                row.languages.split(',').forEach(lang => {
                    uniqueLanguages.add(lang.trim());
                });
            }
        });
        const sortedLanguages = Array.from(uniqueLanguages).sort();

        res.json({
            success: true,
            data: {
                cities: cities.map(c => c.city),
                practice_areas: practiceAreas.map(pa => pa.area_name),
                languages: sortedLanguages,
                experience_ranges: [
                    { label: '0-2 years', min: 0, max: 2 },
                    { label: '3-5 years', min: 3, max: 5 },
                    { label: '6-10 years', min: 6, max: 10 },
                    { label: '10+ years', min: 10, max: 100 }
                ],
                fee_ranges: [
                    { label: 'Free', min: 0, max: 0 },
                    { label: '₹0-500', min: 0, max: 500 },
                    { label: '₹500-1500', min: 500, max: 1500 },
                    { label: '₹1500-5000', min: 1500, max: 5000 },
                    { label: '₹5000+', min: 5000, max: 999999 }
                ],
                ratings: [
                    { label: 'All', value: 0 },
                    { label: '5 Stars Only', value: 5 },
                    { label: '4 Stars & Up', value: 4 },
                    { label: '3 Stars & Up', value: 3 },
                    { label: '2 Stars & Up', value: 2 },
                    { label: '1 Star & Up', value: 1 }
                ],
                availability_options: [
                    'Available Today',
                    'Available This Week',
                    '24/7 Support'
                ],
                genders: ['Male', 'Female']
            }
        });

    } catch (error) {
        console.error("Get filter options error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching filter options",
            error: error.message
        });
    }
};

// ============================================================================
// SEARCH LAWYERS (Dedicated search endpoint)
// ============================================================================
exports.searchLawyers = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const searchTerm = `%${q}%`;

        const sql = `
      SELECT DISTINCT
        l.id,
        u.name,
        l.city,
        l.state,
        l.consultation_fee,
        l.rating as average_rating,
        l.experience,
        l.license_verified as is_verified,
        l.specialization as practice_areas
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      LEFT JOIN lawyer_practice_areas lpa ON l.id = lpa.lawyer_id
      LEFT JOIN practice_areas pa ON lpa.practice_area_id = pa.id
      WHERE u.is_active = 1
        AND (
          u.name LIKE ? OR
          l.city LIKE ? OR
          l.bio LIKE ? OR
          pa.area_name LIKE ?
        )
      GROUP BY l.id
      ORDER BY l.average_rating DESC
      LIMIT ?
    `;

        const [results] = await db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);

        res.json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error("Search lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Error searching lawyers",
            error: error.message
        });
    }
};

// ============================================================================
// CREATE LAWYER PROFILE (Admin only)
// ============================================================================
exports.createLawyer = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        const {
            user_id,
            bar_council_id,
            bar_council_state,
            enrollment_year,
            gender,
            experience,
            consultation_fee,
            bio,
            city,
            state,
            practice_areas,
            languages
        } = req.body;

        // Validation
        if (!user_id || !bar_council_id) {
            return res.status(400).json({
                success: false,
                message: "User ID and Bar Council ID are required"
            });
        }

        // Check if user exists
        const [users] = await db.query(
            "SELECT id, user_type FROM users WHERE id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Insert lawyer profile
        const [result] = await db.query(`
      INSERT INTO lawyers (
        user_id, bar_council_id, bar_council_state, enrollment_year,
        gender, experience, consultation_fee, bio, city, state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            user_id, bar_council_id, bar_council_state, enrollment_year,
            gender, experience || 0, consultation_fee || 0, bio, city, state
        ]);

        const lawyerId = result.insertId;

        // Add practice areas if provided
        if (practice_areas && Array.isArray(practice_areas)) {
            for (const area of practice_areas) {
                const [practiceArea] = await db.query(
                    "SELECT id FROM practice_areas WHERE area_name = ?",
                    [area]
                );
                if (practiceArea.length > 0) {
                    await db.query(
                        "INSERT INTO lawyer_practice_areas (lawyer_id, practice_area_id) VALUES (?, ?)",
                        [lawyerId, practiceArea[0].id]
                    );
                }
            }
        }

        // Add languages if provided
        if (languages && Array.isArray(languages)) {
            for (const lang of languages) {
                const [language] = await db.query(
                    "SELECT id FROM languages WHERE language_name = ?",
                    [lang]
                );
                if (language.length > 0) {
                    await db.query(
                        "INSERT INTO lawyer_languages (lawyer_id, language_id) VALUES (?, ?)",
                        [lawyerId, language[0].id]
                    );
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Lawyer profile created successfully",
            data: { id: lawyerId }
        });

    } catch (error) {
        console.error("Create lawyer error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating lawyer profile",
            error: error.message
        });
    }
};

// ============================================================================
// ADD REVIEW
// ============================================================================
exports.addReview = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }

        const { id: lawyerId } = req.params;
        const { rating, review_text } = req.body;
        const userId = req.user.id;

        if (!rating) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        // Check if lawyer exists
        const [lawyers] = await db.query("SELECT id, user_id FROM lawyers WHERE id = ?", [lawyerId]);
        if (lawyers.length === 0) {
            return res.status(404).json({ success: false, message: "Lawyer not found" });
        }

        // Prevent self-review (if user is also a lawyer and reviews their own profile)
        // Note: user.id from token is user_id, lawyers table has user_id
        if (lawyers[0].user_id === userId) {
            return res.status(400).json({ success: false, message: "You cannot review your own profile" });
        }

        // Check if user already reviewed
        const [existing] = await db.query(
            "SELECT id FROM reviews WHERE lawyer_id = ? AND user_id = ?",
            [lawyerId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this lawyer"
            });
        }

        // Insert review
        // Note: is_verified is set to 1 (true) effectively auto-approving it for display, 
        // to meet user requirement "show on the screen".
        // Also removed review_title column if it doesn't exist, OR insert empty string.
        await db.query(
            `INSERT INTO reviews (lawyer_id, user_id, rating, review_title, review_text, is_verified, created_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
            [lawyerId, userId, rating, '', review_text || '']
        );

        // Recalculate average rating
        // Fetch all reviews to calculate average
        // (Use direct query for accuracy)
        const [avgResult] = await db.query(
            "SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE lawyer_id = ?",
            [lawyerId]
        );

        const newRating = avgResult[0].avg_rating !== null ? parseFloat(avgResult[0].avg_rating) : rating;
        const totalReviews = avgResult[0].total_reviews || 1;

        // Update lawyer table with new rating (optional, but good for performance)
        await db.query(
            "UPDATE lawyers SET rating = ? WHERE id = ?",
            [newRating, lawyerId]
        );

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: {
                rating: parseFloat(newRating).toFixed(1),
                total_reviews: totalReviews
            }
        });

    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({
            success: false,
            message: "Error adding review",
            error: error.message
        });
    }
};

module.exports = exports;
