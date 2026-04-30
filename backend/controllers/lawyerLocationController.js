const Lawyer = require("../models/Lawyer");
const { geocodeAddress, calculateDistance } = require("../services/geocodingService");

// Update lawyer location
exports.updateLawyerLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_line1, address_line2, city, state, country, pincode } = req.body;

    if (!address_line1 || !city || !state || !country) {
      return res.status(400).json({ success: false, message: "Address line 1, city, state, and country are required" });
    }

    const fullAddress = `${address_line1}, ${city}, ${state}, ${country}${pincode ? ", " + pincode : ""}`;
    let coordinates = [0, 0];
    let location_verified = false;

    try {
      const geo = await geocodeAddress(fullAddress);
      coordinates = [geo.lng, geo.lat]; // GeoJSON is [lng, lat]
      location_verified = true;
    } catch (geoErr) {
      console.warn("⚠️ Could not geocode address:", geoErr.message);
    }

    const lawyer = await Lawyer.findOneAndUpdate(
      { user: userId },
      { city, state, location: { type: "Point", coordinates } },
      { new: true }
    );

    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    return res.json({ success: true, message: "Location updated successfully", data: { coordinates, location_verified } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating lawyer location", error: error.message });
  }
};

// Get lawyers for map
exports.getLawyersForMap = async (req, res) => {
  try {
    const { city, practice_area, verified_only, user_lat, user_lng, radius_km } = req.query;
    const filter = { "location.coordinates": { $ne: [0, 0] } };
    if (city) filter.city = new RegExp(city, "i");
    if (practice_area) filter.specialization = new RegExp(practice_area, "i");
    if (verified_only === "true") filter.license_verified = true;

    let lawyers = await Lawyer.find(filter)
      .populate({ path: "user", match: { is_active: true }, select: "name profile_image is_verified" })
      .sort({ rating: -1 });

    lawyers = lawyers.filter(l => l.user);

    let result = lawyers.map(l => ({
      id: l._id,
      name: l.user.name,
      profile_image: l.user.profile_image,
      practice_areas: l.specialization,
      experience: l.experience,
      consultation_fee: l.consultation_fee,
      average_rating: l.rating,
      city: l.city,
      state: l.state,
      latitude: l.location?.coordinates[1] || null,
      longitude: l.location?.coordinates[0] || null,
    }));

    if (user_lat && user_lng) {
      result = result.map(l => ({
        ...l,
        distance_km: l.latitude && l.longitude ? calculateDistance(parseFloat(user_lat), parseFloat(user_lng), l.latitude, l.longitude) : null
      }));
      if (radius_km) result = result.filter(l => l.distance_km && l.distance_km <= parseFloat(radius_km));
      result.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    return res.json({ success: true, data: result, count: result.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyers for map", error: error.message });
  }
};

// Get nearby lawyers
exports.getNearbyLawyers = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "Latitude and longitude are required" });

    const lawyers = await Lawyer.find({
      location: { $near: { $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseFloat(radius) * 1000 } }
    }).populate({ path: "user", match: { is_active: true }, select: "name profile_image" }).limit(50);

    const result = lawyers.filter(l => l.user).map(l => ({
      id: l._id,
      name: l.user.name,
      profile_image: l.user.profile_image,
      specialization: l.specialization,
      city: l.city, state: l.state,
      latitude: l.location?.coordinates[1], longitude: l.location?.coordinates[0],
    }));

    return res.json({ success: true, data: result, count: result.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error finding nearby lawyers", error: error.message });
  }
};

// Geocode lawyer address (admin)
exports.geocodeLawyerAddress = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });

    const fullAddress = `${lawyer.city}, ${lawyer.state}`;
    const geo = await geocodeAddress(fullAddress);
    lawyer.location = { type: "Point", coordinates: [geo.lng, geo.lat] };
    await lawyer.save();

    return res.json({ success: true, message: "Address geocoded successfully", data: { latitude: geo.lat, longitude: geo.lng } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error geocoding address", error: error.message });
  }
};

module.exports = exports;
