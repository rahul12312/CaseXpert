// ============================================================================
// STANDALONE GEOCODING SCRIPT - Geocode All Lawyers
// ============================================================================

require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'casexpert_db',
    port: process.env.DB_PORT || 3306
};

// Nominatim geocoding function (FREE!)
async function geocodeAddress(address) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'CaseXpert Legal Marketplace/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                display_name: result.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('   ❌ Geocoding error:', error.message);
        return null;
    }
}

async function main() {
    let connection;

    try {
        console.log('\n' + '='.repeat(60));
        console.log('🗺️  GEOCODING EXISTING LAWYERS');
        console.log('='.repeat(60) + '\n');

        // Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected!\n');

        // Get lawyers without coordinates
        const [lawyers] = await connection.query(`
      SELECT id, user_id, address_line1, address_line2, city, state, country
      FROM lawyers
      WHERE (latitude IS NULL OR longitude IS NULL)
        AND city IS NOT NULL
      ORDER BY id
    `);

        console.log(`📊 Found ${lawyers.length} lawyers to geocode\n`);

        if (lawyers.length === 0) {
            console.log('✅ All lawyers already have coordinates!');
            console.log('💡 Nothing to do!\n');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const lawyer of lawyers) {
            try {
                // Construct full address
                const addressParts = [
                    lawyer.address_line1,
                    lawyer.city,
                    lawyer.state,
                    lawyer.country || 'India'
                ].filter(Boolean);

                const fullAddress = addressParts.join(', ');

                console.log(`📍 [${lawyer.id}] Geocoding: ${fullAddress}...`);

                // Geocode using FREE Nominatim
                const result = await geocodeAddress(fullAddress);

                if (result && result.lat && result.lng) {
                    // Update database
                    await connection.query(`
            UPDATE lawyers
            SET latitude = ?,
                longitude = ?,
                location_verified = TRUE
            WHERE id = ?
          `, [result.lat, result.lng, lawyer.id]);

                    console.log(`   ✅ Success: ${result.lat}, ${result.lng}`);
                    console.log(`   📍 ${result.display_name}\n`);
                    successCount++;
                } else {
                    console.log(`   ⚠️  No coordinates found\n`);
                    failCount++;
                }

                // IMPORTANT: Wait 1 second between requests (Nominatim usage policy)
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.log(`   ❌ Error: ${error.message}\n`);
                failCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 GEOCODING COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ Successfully geocoded: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📊 Total processed: ${lawyers.length}`);
        console.log('='.repeat(60) + '\n');

        if (successCount > 0) {
            console.log('🎉 Great! Your lawyers now have map coordinates!');
            console.log('💡 Next steps:');
            console.log('   1. Refresh your browser');
            console.log('   2. Visit any lawyer profile');
            console.log('   3. Click "Location" tab');
            console.log('   4. See the beautiful FREE map! 🗺️✨\n');
        }

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   - Check database connection in backend/.env');
        console.error('   - Make sure MySQL is running');
        console.error('   - Verify database credentials\n');
    } finally {
        if (connection) {
            await connection.end();
            console.log('📡 Database connection closed.\n');
        }
    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
