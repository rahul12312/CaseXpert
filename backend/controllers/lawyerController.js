const Lawyer = require("../models/Lawyer");
const User = require("../models/User");

// Add lawyer profile
exports.addLawyer = async (req, res) => {
  try {
    const { user_id, specialization, experience, languages, rating, fee_per_hour, bio, city, state } = req.body;
    if (!user_id || !specialization) {
      return res.status(400).json({ success: false, message: "User ID and specialization are required" });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.user_type !== "lawyer") {
      return res.status(400).json({ success: false, message: "User must have lawyer type to create lawyer profile" });
    }

    const existing = await Lawyer.findOne({ user: user_id });
    if (existing) return res.status(409).json({ success: false, message: "Lawyer profile already exists for this user" });

    const lawyer = await Lawyer.create({
      user: user_id, specialization, experience: experience || 0,
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(",").map(l => l.trim()) : []),
      rating: rating || 0, consultation_fee: fee_per_hour || 0,
      bio: bio || null, city: city || null, state: state || null, license_verified: true,
    });

    return res.status(201).json({ success: true, message: "Lawyer profile created successfully", data: { lawyerId: lawyer._id, user_id, specialization } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating lawyer profile", error: error.message });
  }
};

// Get all lawyers
exports.getAllLawyers = async (req, res) => {
  try {
    const { specialization, city, min_rating, limit = 20, offset = 0 } = req.query;
    const filter = { license_verified: true };
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    if (city) filter.city = city;
    if (min_rating) filter.rating = { $gte: parseFloat(min_rating) };

    const lawyers = await Lawyer.find(filter)
      .populate({ path: "user", match: { is_active: true }, select: "name email phone" })
      .sort({ rating: -1, experience: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const filtered = lawyers.filter(l => l.user);
    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyers", error: error.message });
  }
};

// Get lawyer by ID with reviews
exports.getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate("user", "name email phone profile_image is_verified is_active");
    if (!lawyer || !lawyer.user || !lawyer.user.is_active || !lawyer.license_verified) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    const totalReviews = lawyer.reviews.length;
    const averageRating = totalReviews > 0
      ? (lawyer.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : (lawyer.rating || 0).toFixed(1);

    return res.json({
      success: true,
      data: {
        ...lawyer.toObject(),
        name: lawyer.user.name, email: lawyer.user.email,
        phone: lawyer.user.phone, profile_image: lawyer.user.profile_image,
        is_verified: lawyer.user.is_verified,
        average_rating: parseFloat(averageRating), total_reviews: totalReviews,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyer details", error: error.message });
  }
};

// Add Review
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
    if (lawyer.reviews.some(r => r.user && r.user.toString() === userId.toString())) {
      return res.status(400).json({ success: false, message: "You have already reviewed this lawyer" });
    }

    lawyer.reviews.push({ user: userId, rating, review_text: review_text || "" });
    lawyer.rating = parseFloat((lawyer.reviews.reduce((s, r) => s + r.rating, 0) / lawyer.reviews.length).toFixed(2));
    await lawyer.save();

    return res.status(201).json({ success: true, message: "Review added successfully", data: { rating: lawyer.rating.toFixed(1) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};

// Update lawyer profile
exports.updateLawyer = async (req, res) => {
  try {
    const updates = {};
    const fields = ["specialization", "experience", "languages", "consultation_fee", "bio", "city", "state", "availability_status"];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.body.fee_per_hour !== undefined) updates.consultation_fee = req.body.fee_per_hour;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
    return res.json({ success: true, message: "Lawyer profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating lawyer profile", error: error.message });
  }
};

// Delete lawyer profile
exports.deleteLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndDelete(req.params.id);
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
    return res.json({ success: true, message: "Lawyer profile deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting lawyer profile", error: error.message });
  }
};
