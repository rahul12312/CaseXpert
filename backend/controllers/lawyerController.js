const { getDatabase } = require('../config/database');

// Add lawyer profile
exports.addLawyer = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const {
      user_id,
      specialization,
      experience,
      languages,
      rating,
      fee_per_hour,
      bio,
      city,
      state
    } = req.body;

    // Validation
    if (!user_id || !specialization) {
      return res.status(400).json({
        success: false,
        message: "User ID and specialization are required"
      });
    }

    // Check if user exists and is a lawyer
    const [users] = await db.execute(
      "SELECT id, user_type FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (users[0].user_type !== "lawyer") {
      return res.status(400).json({
        success: false,
        message: "User must have lawyer type to create lawyer profile"
      });
    }

    // Check if lawyer profile already exists
    const [existingLawyer] = await db.execute(
      "SELECT id FROM lawyers WHERE user_id = ?",
      [user_id]
    );

    if (existingLawyer.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Lawyer profile already exists for this user"
      });
    }

    // Insert lawyer profile
    const sql = `INSERT INTO lawyers (user_id, specialization, experience, languages, rating, consultation_fee, bio, city, state, license_verified, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`;

    const [result] = await db.execute(sql, [
      user_id,
      specialization,
      experience || 0,
      languages ? JSON.stringify(languages) : null,
      rating || 0.00,
      fee_per_hour || 0.00,
      bio || null,
      city || null,
      state || null
    ]);

    res.status(201).json({
      success: true,
      message: "Lawyer profile created successfully",
      data: {
        lawyerId: result.insertId,
        user_id,
        specialization
      }
    });
  } catch (error) {
    console.error("Add lawyer error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating lawyer profile",
      error: error.message
    });
  }
};

// Get all lawyers
exports.getAllLawyers = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const { specialization, city, min_rating, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT 
        l.id,
        l.user_id,
        u.name,
        u.email,
        u.phone,
        l.specialization,
        l.experience,
        l.languages,
        l.rating,
        l.consultation_fee as fee_per_hour,
        l.bio,
        l.city,
        l.state,
        l.availability_status
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = 1 AND l.license_verified = 1
    `;

    const params = [];

    if (specialization) {
      sql += " AND l.specialization LIKE ?";
      params.push(`%${specialization}%`);
    }

    if (city) {
      sql += " AND l.city = ?";
      params.push(city);
    }

    if (min_rating) {
      sql += " AND l.rating >= ?";
      params.push(parseFloat(min_rating));
    }

    sql += " ORDER BY l.rating DESC, l.experience DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [lawyers] = await db.execute(sql, params);

    res.json({
      success: true,
      count: lawyers.length,
      data: lawyers
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

// Get lawyer by ID with reviews
exports.getLawyerById = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        l.*,
        u.name,
        u.email,
        u.phone,
        u.profile_image,
        u.is_verified
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.is_active = 1 AND l.license_verified = 1
    `;

    const [lawyers] = await db.execute(sql, [id]);

    if (lawyers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found"
      });
    }

    const lawyer = lawyers[0];

    // Fetch reviews
    const reviewSql = `
      SELECT 
        r.id,
        r.rating,
        r.review_title,
        r.review_text,
        r.created_at,
        u.name as reviewer_name,
        u.profile_image as reviewer_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.lawyer_id = ?
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await db.execute(reviewSql, [id]);

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / totalReviews).toFixed(1)
      : (lawyer.rating || 0).toFixed(1);

    // Attach reviews and computed fields
    lawyer.reviews = reviews;
    lawyer.average_rating = averageRating;
    lawyer.total_reviews = totalReviews;

    // Use computed rating if database rating is outdated, otherwise existing
    if (parseFloat(averageRating) !== parseFloat(lawyer.rating)) {
      // Sync database asynchronously
      db.execute("UPDATE lawyers SET rating = ? WHERE id = ?", [averageRating, id]).catch(console.error);
    }

    // Ensure numeric types for frontend
    lawyer.rating = parseFloat(averageRating);

    res.json({
      success: true,
      data: lawyer
    });
  } catch (error) {
    console.error("Get lawyer error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lawyer details",
      error: error.message
    });
  }
};

// Add Review
exports.addReview = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const { id: lawyerId } = req.params;
    const { rating, review_title, review_text } = req.body;
    const userId = req.user.id;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required"
      });
    }

    // Check if lawyer exists
    const [lawyers] = await db.execute("SELECT id, user_id FROM lawyers WHERE id = ?", [lawyerId]);
    if (lawyers.length === 0) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    // Prevent self-review
    if (lawyers[0].user_id === userId) {
      return res.status(400).json({ success: false, message: "You cannot review your own profile" });
    }

    // Check if user already reviewed
    const [existing] = await db.execute(
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
    await db.execute(
      `INSERT INTO reviews (lawyer_id, user_id, rating, review_title, review_text, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [lawyerId, userId, rating, review_title || '', review_text || '']
    );

    // Recalculate average rating
    const [avgResult] = await db.execute(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE lawyer_id = ?",
      [lawyerId]
    );

    const newRating = avgResult[0].avg_rating || rating;

    // Update lawyer table with new rating
    await db.execute(
      "UPDATE lawyers SET rating = ? WHERE id = ?",
      [newRating, lawyerId]
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: {
        rating: parseFloat(newRating).toFixed(1)
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

// Update lawyer profile
exports.updateLawyer = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const { id } = req.params;
    const {
      specialization,
      experience,
      languages,
      consultation_fee,
      bio,
      city,
      state,
      availability_status,
      courts
    } = req.body;

    const updates = [];
    const values = [];

    if (specialization) {
      updates.push("specialization = ?");
      values.push(specialization);
    }
    if (experience !== undefined) {
      updates.push("experience = ?");
      values.push(experience);
    }
    if (languages) {
      updates.push("languages = ?");
      values.push(languages);
    }
    if (consultation_fee !== undefined) {
      updates.push("consultation_fee = ?");
      values.push(consultation_fee);
    }
    if (bio) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (city) {
      updates.push("city = ?");
      values.push(city);
    }
    if (state) {
      updates.push("state = ?");
      values.push(state);
    }
    if (availability_status) {
      updates.push("availability_status = ?");
      values.push(availability_status);
    }
    if (courts) {
      updates.push("courts = ?");
      values.push(JSON.stringify(courts));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);

    const sql = `UPDATE lawyers SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`;
    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found"
      });
    }

    res.json({
      success: true,
      message: "Lawyer profile updated successfully"
    });
  } catch (error) {
    console.error("Update lawyer error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lawyer profile",
      error: error.message
    });
  }
};

// Delete lawyer profile
exports.deleteLawyer = async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ message: 'Database error' });

  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM lawyers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found"
      });
    }

    res.json({
      success: true,
      message: "Lawyer profile deleted successfully"
    });
  } catch (error) {
    console.error("Delete lawyer error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting lawyer profile",
      error: error.message
    });
  }
};
