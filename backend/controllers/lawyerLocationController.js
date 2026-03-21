// ============================================================================
// LAWYER LOCATION CONTROLLER - Handles location updates and geocoding
// ============================================================================

const { getDatabase } = require('../config/database');
const {
    geocodeAddress,
    reverseGeocode,
    calculateDistance
} = require('../services/geocodingService');

/**
 * Update lawyer location (for lawyer profile)
 * POST /api/lawyer-location/update
 */
exports.updateLawyerLocation = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const { lawyerId } = req.user; // From auth middleware
        const {
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode
        } = req.body;

        // Validation
        if (!address_line1 || !city || !state || !country) {
            return res.status(400).json({
                success: false,
                message: 'Address line 1, city, state, and country are required'
            });
        }

        // Construct full address for geocoding
        const fullAddress = `${address_line1}, ${city}, ${state}, ${country}${pincode ? ', ' + pincode : ''}`;

        // Geocode the address
        let latitude = null, longitude = null, location_verified = false;
        try {
            const geoResult = await geocodeAddress(fullAddress);
            latitude = geoResult.lat;
            longitude = geoResult.lng;
            location_verified = true;
            console.log(`✅ Geocoded address for lawyer ${lawyerId}:`, { latitude, longitude });
        } catch (geoError) {
            console.warn(`⚠️ Could not geocode address for lawyer ${lawyerId}:`, geoError.message);
            // Continue without coordinates
        }

        // Update lawyer location
        const [result] = await db.query(`
      UPDATE lawyers
      SET 
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        country = ?,
        pincode = ?,
        latitude = ?,
        longitude = ?,
        location_verified = ?
      WHERE id = ?
    `, [
            address_line1,
            address_line2 || null,
            city,
            state,
            country,
            pincode || null,
            latitude,
            longitude,
            location_verified,
            lawyerId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: {
                latitude,
                longitude,
                location_verified
            }
        });

    } catch (error) {
        console.error('Update lawyer location error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lawyer location',
            error: error.message
        });
    }
};

/**
 * Get lawyers with location (for map display)
 * GET /api/lawyer-location/map
 */
exports.getLawyersForMap = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const {
            city,
            practice_area,
            verified_only,
            user_lat,
            user_lng,
            radius_km // Filter by distance
        } = req.query;

        let sql = `
      SELECT 
        l.id,
        l.user_id,
        u.name,
        u.profile_image,
        l.specialization as practice_areas,
        l.experience,
        l.fee_per_hour as consultation_fee,
        l.rating as average_rating,
        l.total_cases,
        l.address_line1,
        l.city,
        l.state,
        l.country,
        l.pincode,
        l.latitude,
        l.longitude,
        l.location_verified,
        l.office_type,
        u.is_verified
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE u.is_active = 1 
        AND l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
    `;

        const params = [];

        // Filters
        if (city) {
            sql += ` AND l.city = ?`;
            params.push(city);
        }

        if (practice_area) {
            sql += ` AND l.specialization LIKE ?`;
            params.push(`%${practice_area}%`);
        }

        if (verified_only === 'true') {
            sql += ` AND u.is_verified = 1`;
        }

        sql += ` ORDER BY l.rating DESC`;

        const [lawyers] = await db.query(sql, params);

        // Calculate distances if user location provided
        if (user_lat && user_lng) {
            lawyers.forEach(lawyer => {
                lawyer.distance_km = calculateDistance(
                    parseFloat(user_lat),
                    parseFloat(user_lng),
                    lawyer.latitude,
                    lawyer.longitude
                );
            });

            // Filter by radius if specified
            let filteredLawyers = lawyers;
            if (radius_km) {
                filteredLawyers = lawyers.filter(l => l.distance_km <= parseFloat(radius_km));
            }

            // Sort by distance
            filteredLawyers.sort((a, b) => a.distance_km - b.distance_km);

            return res.json({
                success: true,
                data: filteredLawyers,
                count: filteredLawyers.length
            });
        }

        res.json({
            success: true,
            data: lawyers,
            count: lawyers.length
        });

    } catch (error) {
        console.error('Get lawyers for map error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lawyers for map',
            error: error.message
        });
    }
};

/**
 * Geocode a lawyer's existing address
 * POST /api/lawyer-location/geocode/:id (Admin only)
 */
exports.geocodeLawyerAddress = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const { id } = req.params;

        // Get lawyer's address
        const [lawyers] = await db.query(`
      SELECT address_line1, address_line2, city, state, country, pincode
      FROM lawyers
      WHERE id = ?
    `, [id]);

        if (lawyers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer not found'
            });
        }

        const lawyer = lawyers[0];
        const fullAddress = `${lawyer.address_line1}, ${lawyer.city}, ${lawyer.state}, ${lawyer.country}${lawyer.pincode ? ', ' + lawyer.pincode : ''}`;

        // Geocode
        const geoResult = await geocodeAddress(fullAddress);

        // Update coordinates
        await db.query(`
      UPDATE lawyers
      SET latitude = ?, longitude = ?, location_verified = TRUE
      WHERE id = ?
    `, [geoResult.lat, geoResult.lng, id]);

        res.json({
            success: true,
            message: 'Address geocoded successfully',
            data: {
                latitude: geoResult.lat,
                longitude: geoResult.lng,
                formatted_address: geoResult.formatted_address
            }
        });

    } catch (error) {
        console.error('Geocode lawyer address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error geocoding address',
            error: error.message
        });
    }
};

/**
 * Find lawyers near user location
 * GET /api/lawyer-location/nearby?lat=&lng=&radius=
 */
exports.getNearbyLawyers = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const { lat, lng, radius = 50 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Get all lawyers with location
        const [lawyers] = await db.query(`
      SELECT 
        l.id,
        u.name,
        u.profile_image,
        l.specialization as practice_areas,
        l.experience,
        l.fee_per_hour as consultation_fee,
        l.rating as average_rating,
        l.address_line1,
        l.city,
        l.state,
        l.latitude,
        l.longitude
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE u.is_active = 1 
        AND l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
    `);

        // Calculate distances and filter
        const nearbyLawyers = lawyers
            .map(lawyer => ({
                ...lawyer,
                distance_km: calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    lawyer.latitude,
                    lawyer.longitude
                )
            }))
            .filter(lawyer => lawyer.distance_km <= parseFloat(radius))
            .sort((a, b) => a.distance_km - b.distance_km);

        res.json({
            success: true,
            data: nearbyLawyers,
            count: nearbyLawyers.length,
            search_params: {
                user_location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                radius_km: parseFloat(radius)
            }
        });

    } catch (error) {
        console.error('Get nearby lawyers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding nearby lawyers',
            error: error.message
        });
    }
};

module.exports = exports;
