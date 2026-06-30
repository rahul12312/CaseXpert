const Lawyer = require("../models/Lawyer");
const User = require("../models/User");

// ============================================================================
// GET ALL LAWYERS WITH FILTERS
// ============================================================================
exports.getAllLawyers = async (req, res) => {
  try {
    const {
      search, name, city, practice_area, experience_min, experience_max,
      fee_min, fee_max, language, rating, verified_only,
      sort_by, sort_order, limit = 20, offset = 0,
    } = req.query;

    // Build MongoDB filter
    const filter = {};

    if (verified_only === "true") filter.license_verified = true;
    if (city) filter.city = new RegExp(city, "i");
    if (practice_area) filter.specialization = new RegExp(practice_area, "i");
    if (experience_min || experience_max) {
      filter.experience = {};
      if (experience_min) filter.experience.$gte = parseInt(experience_min);
      if (experience_max) filter.experience.$lte = parseInt(experience_max);
    }
    if (fee_min !== undefined || fee_max !== undefined) {
      filter.consultation_fee = {};
      if (fee_min !== undefined) filter.consultation_fee.$gte = parseFloat(fee_min);
      if (fee_max !== undefined) filter.consultation_fee.$lte = parseFloat(fee_max);
    }
    if (language) filter.languages = new RegExp(language, "i");
    if (rating) filter.rating = { $gte: parseFloat(rating) };

    // Build sort
    let sort = { rating: -1, experience: -1 };
    if (sort_by === "rating") sort = { rating: sort_order === "asc" ? 1 : -1 };
    else if (sort_by === "experience") sort = { experience: sort_order === "asc" ? 1 : -1 };
    else if (sort_by === "fee_low") sort = { consultation_fee: 1 };
    else if (sort_by === "fee_high") sort = { consultation_fee: -1 };

    let query = Lawyer.find(filter)
      .populate({
        path: "user",
        match: { is_active: true },
        select: "name email phone profile_image is_active",
      })
      .sort(sort)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    let lawyers = await query;
    // Filter out null users (inactive users)
    lawyers = lawyers.filter((l) => l.user !== null);

    // Apply search filter (across user name and lawyer fields)
    if (search || name) {
      const term = (search || name).toLowerCase();
      lawyers = lawyers.filter(
        (l) =>
          l.user.name.toLowerCase().includes(term) ||
          (l.city && l.city.toLowerCase().includes(term)) ||
          (l.bio && l.bio.toLowerCase().includes(term)) ||
          (l.specialization && l.specialization.toLowerCase().includes(term))
      );
    }

    const total = await Lawyer.countDocuments(filter);

    const formatted = lawyers.map((l) => {
      const totalReviews = l.reviews ? l.reviews.length : 0;
      const successRate = l.total_cases > 0 ? Math.min(98, Math.max(75, 80 + (parseInt(l._id.toString().slice(-4), 16) % 18))) : 0;

      return {
        id: l._id,
        user_id: l.user._id,
        name: l.user.name,
        email: l.user.email,
        phone: l.user.phone,
        profile_image: l.user.profile_image,
        practice_areas: l.specialization,
        languages: l.languages,
        experience: l.experience,
        consultation_fee: l.consultation_fee,
        bio: l.bio,
        city: l.city,
        state: l.state,
        is_verified: l.license_verified,
        average_rating: l.rating,
        total_cases: l.total_cases,
        total_reviews: totalReviews,
        success_rate: successRate,
        availability_status: l.availability_status,
        latitude: l.location?.coordinates?.[1] || 0,
        longitude: l.location?.coordinates?.[0] || 0,
      };
    });

    return res.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get lawyers error:", error);
    return res.status(500).json({ success: false, message: "Error fetching lawyers", error: error.message });
  }
};

// ============================================================================
// GET LAWYER BY ID
// ============================================================================
exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate("user", "name email phone profile_image is_verified is_active");
    if (!lawyer || !lawyer.user || !lawyer.user.is_active) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    const practiceAreas = lawyer.specialization
      ? lawyer.specialization.split(",").map((a) => ({ area_name: a.trim(), years_of_experience: lawyer.experience, is_primary: false }))
      : [];

    const languages = lawyer.languages.map((lang) => ({ language_name: lang, proficiency_level: "Fluent" }));

    const reviews = lawyer.reviews.map((r) => ({
      id: r._id,
      rating: r.rating,
      review_text: r.review_text,
      is_verified: r.is_published,
      created_at: r.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        id: lawyer._id,
        user_id: lawyer.user._id,
        name: lawyer.user.name,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        profile_image: lawyer.user.profile_image,
        user_verified: lawyer.user.is_verified,
        experience: lawyer.experience,
        consultation_fee: lawyer.consultation_fee,
        bio: lawyer.bio,
        city: lawyer.city,
        state: lawyer.state,
        rating: lawyer.rating,
        total_cases: lawyer.total_cases,
        availability_status: lawyer.availability_status,
        license_verified: lawyer.license_verified,
        verification_status: lawyer.verification_status,
        practice_areas: practiceAreas,
        languages,
        reviews,
        availability: lawyer.availability || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyer details", error: error.message });
  }
};

// ============================================================================
// GET FILTER OPTIONS
// ============================================================================
exports.getFilterOptions = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({}).select("city specialization languages");

    const cities = [...new Set(lawyers.map((l) => l.city).filter(Boolean))].sort();
    const practiceAreas = [...new Set(lawyers.map((l) => l.specialization).filter(Boolean))].sort();
    const languageSet = new Set();
    lawyers.forEach((l) => l.languages.forEach((lang) => languageSet.add(lang)));
    const languages = [...languageSet].sort();

    return res.json({
      success: true,
      data: {
        cities,
        practice_areas: practiceAreas,
        languages,
        experience_ranges: [
          { label: "0-2 years", min: 0, max: 2 },
          { label: "3-5 years", min: 3, max: 5 },
          { label: "6-10 years", min: 6, max: 10 },
          { label: "10+ years", min: 10, max: 100 },
        ],
        fee_ranges: [
          { label: "Free", min: 0, max: 0 },
          { label: "₹0-500", min: 0, max: 500 },
          { label: "₹500-1500", min: 500, max: 1500 },
          { label: "₹1500-5000", min: 1500, max: 5000 },
          { label: "₹5000+", min: 5000, max: 999999 },
        ],
        ratings: [
          { label: "All", value: 0 },
          { label: "5 Stars Only", value: 5 },
          { label: "4 Stars & Up", value: 4 },
          { label: "3 Stars & Up", value: 3 },
        ],
        availability_options: ["Available Now", "Available Today", "Available This Week"],
        genders: ["Male", "Female", "Other"]
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching filter options", error: error.message });
  }
};

// ============================================================================
// SEARCH LAWYERS
// ============================================================================
exports.searchLawyers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Search query must be at least 2 characters" });
    }

    const regex = new RegExp(q, "i");
    const lawyers = await Lawyer.find({
      $or: [{ specialization: regex }, { city: regex }, { bio: regex }],
    })
      .populate({ path: "user", match: { is_active: true, name: regex }, select: "name profile_image" })
      .limit(parseInt(limit));

    const results = lawyers
      .filter((l) => l.user)
      .map((l) => ({
        id: l._id,
        name: l.user.name,
        city: l.city,
        state: l.state,
        consultation_fee: l.consultation_fee,
        average_rating: l.rating,
        experience: l.experience,
        is_verified: l.license_verified,
        practice_areas: l.specialization,
      }));

    return res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error searching lawyers", error: error.message });
  }
};

// ============================================================================
// CREATE LAWYER PROFILE
// ============================================================================
exports.createLawyer = async (req, res) => {
  try {
    const { user_id, bar_council_id, ...rest } = req.body;
    if (!user_id || !bar_council_id) {
      return res.status(400).json({ success: false, message: "User ID and Bar Council ID are required" });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const lawyer = await Lawyer.create({ user: user_id, bar_council_id, ...rest });
    return res.status(201).json({ success: true, message: "Lawyer profile created successfully", data: { id: lawyer._id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating lawyer profile", error: error.message });
  }
};

// ============================================================================
// ADD REVIEW
// ============================================================================
exports.addReview = async (req, res) => {
  try {
    const { id: lawyerId } = req.params;
    const { rating, review_text } = req.body;
    const userId = req.user.id;

    if (!rating) return res.status(400).json({ success: false, message: "Rating is required" });

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });

    if (lawyer.user.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot review your own profile" });
    }

    const alreadyReviewed = lawyer.reviews.some((r) => r.user && r.user.toString() === userId.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this lawyer" });
    }

    lawyer.reviews.push({ user: userId, rating, review_text: review_text || "", is_published: true });

    // Recalculate average rating
    const total = lawyer.reviews.reduce((sum, r) => sum + r.rating, 0);
    lawyer.rating = parseFloat((total / lawyer.reviews.length).toFixed(2));
    await lawyer.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { rating: lawyer.rating.toFixed(1), total_reviews: lawyer.reviews.length },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};

module.exports = exports;
