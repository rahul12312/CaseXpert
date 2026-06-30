// ============================================================================
// GEOCODING SERVICE - Convert address to coordinates and vice versa
// Supports Google Maps API and fallback to OpenStreetMap (Nominatim)
// ============================================================================

const axios = require('axios');

/**
 * Geocode an address to latitude and longitude using Google Maps API
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number, formatted_address: string}>}
 */
async function geocodeAddressGoogle(address) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn('⚠️ Google Maps API key not configured, using fallback');
            return geocodeAddressOSM(address);
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: apiKey
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
                place_id: result.place_id
            };
        } else {
            throw new Error(`Geocoding failed: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Google geocoding error:', error.message);
        // Fallback to OpenStreetMap
        return geocodeAddressOSM(address);
    }
}

/**
 * Geocode an address using OpenStreetMap Nominatim (FREE, no API key required)
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number, formatted_address: string}>}
 */
async function geocodeAddressOSM(address) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'CaseXpert Legal Marketplace'
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                formatted_address: result.display_name,
                place_id: result.place_id
            };
        } else {
            throw new Error('No results found from Nominatim');
        }
    } catch (error) {
        console.error('Nominatim geocoding error:', error.message);
        throw new Error('Failed to geocode address');
    }
}

/**
 * Reverse geocode coordinates to address using Google Maps API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, state: string, country: string}>}
 */
async function reverseGeocodeGoogle(lat, lng) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn('⚠️ Google Maps API key not configured, using fallback');
            return reverseGeocodeOSM(lat, lng);
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: apiKey
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const addressComponents = result.address_components;

            // Extract city, state, country
            let city = '', state = '', country = '';
            addressComponents.forEach(component => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
            });

            return {
                address: result.formatted_address,
                city,
                state,
                country
            };
        } else {
            throw new Error(`Reverse geocoding failed: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Google reverse geocoding error:', error.message);
        return reverseGeocodeOSM(lat, lng);
    }
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, state: string, country: string}>}
 */
async function reverseGeocodeOSM(lat, lng) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat,
                lon: lng,
                format: 'json',
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'CaseXpert Legal Marketplace'
            }
        });

        if (response.data) {
            const addr = response.data.address;
            return {
                address: response.data.display_name,
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                country: addr.country || ''
            };
        } else {
            throw new Error('No results from Nominatim reverse geocoding');
        }
    } catch (error) {
        console.error('Nominatim reverse geocoding error:', error.message);
        throw new Error('Failed to reverse geocode coordinates');
    }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Main geocoding function (auto-selects best provider)
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number, formatted_address: string}>}
 */
async function geocodeAddress(address) {
    // Validate input
    if (!address || address.trim().length < 5) {
        throw new Error('Invalid address provided');
    }

    // Try Google first, fallback to OSM
    return geocodeAddressGoogle(address);
}

/**
 * Main reverse geocoding function
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, state: string, country: string}>}
 */
async function reverseGeocode(lat, lng) {
    // Validate coordinates
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates provided');
    }

    return reverseGeocodeGoogle(lat, lng);
}

module.exports = {
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    geocodeAddressGoogle,
    geocodeAddressOSM,
    reverseGeocodeGoogle,
    reverseGeocodeOSM
};
