// Script to batch update missing lawyer coordinates
const { createDatabasePool, getDatabase } = require('./config/database');
const { geocodeAddress } = require('./services/geocodingService');

const DELAY_MS = 1500; // 1.5s delay for OSM rate limits

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateLawyerCoordinates() {
    console.log('🌍 Starting Lawyer Geocoding Update...');

    try {
        // Ensure DB connection
        await createDatabasePool();
        const pool = getDatabase();

        // 1. Get lawyers without coordinates
        const [lawyers] = await pool.query(`
      SELECT l.id, u.name, l.address_line1, l.city, l.state, l.country, l.pincode 
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE (l.latitude IS NULL OR l.longitude IS NULL OR l.latitude = 0 OR l.longitude = 0)
    `);

        console.log(`📋 Found ${lawyers.length} lawyers with missing coordinates.`);

        if (lawyers.length === 0) {
            console.log('✅ All lawyers have coordinates. Exiting.');
            process.exit(0);
        }

        let successCount = 0;
        let failCount = 0;

        // 2. Iterate and geocode
        for (const lawyer of lawyers) {
            // Construct address
            const addressParts = [
                lawyer.address_line1,
                lawyer.city,
                lawyer.state,
                lawyer.country,
                lawyer.pincode
            ].filter(part => part && part.trim() !== '');

            const fullAddress = addressParts.join(', ');

            if (addressParts.length < 2) {
                console.log(`⚠️ Skipping Lawyer ID ${lawyer.id} (${lawyer.name}): Insufficient address details`);
                failCount++;
                continue;
            }

            console.log(`\n📍 Processing ID ${lawyer.id}: ${lawyer.name}`);
            console.log(`   Address: ${fullAddress}`);

            try {
                // Call geocoding service
                const result = await geocodeAddress(fullAddress);

                if (result && result.lat && result.lng) {
                    console.log(`   ✅ Found: ${result.lat}, ${result.lng} (${result.formatted_address})`);

                    // Update DB
                    await pool.query(
                        'UPDATE lawyers SET latitude = ?, longitude = ?, location_verified = 1 WHERE id = ?',
                        [result.lat, result.lng, lawyer.id]
                    );

                    successCount++;
                } else {
                    console.log('   ❌ Geocoding returned no coordinates');
                    failCount++;
                }

            } catch (error) {
                console.error(`   ❌ Error: ${error.message}`);
                failCount++;
            }

            // Respect rate limits
            await delay(DELAY_MS);
        }

        console.log('\n=============================================');
        console.log(`🎉 Update Complete!`);
        console.log(`✅ Updated: ${successCount}`);
        console.log(`❌ Failed:  ${failCount}`);
        console.log('=============================================');

    } catch (error) {
        console.error('🔥 Critical Error:', error);
    } finally {
        process.exit(0);
    }
}

// Run if called directly
updateLawyerCoordinates();
