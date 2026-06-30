const { createDatabasePool, getDatabase } = require('./config/database');

async function test() {
    await createDatabasePool();
    const db = getDatabase();
    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.*,
                l.id as lawyer_id,
                u.name as lawyer_name,
                u.profile_image as lawyer_image,
                l.specialization,
                l.fee_per_hour as consultation_fee
            FROM bookings b
            LEFT JOIN lawyers l ON b.lawyer_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [352]);
        console.log("Bookings:", bookings.length);
    } catch (e) {
        console.error("Error:", e);
    }
    
    try {
        const [all] = await db.query("SELECT * FROM bookings");
        console.log("All Bookings count:", all.length);
        if (all.length > 0) console.log(all[0]);
    } catch (e) {
        console.error("Booking count error:", e);
    }
    process.exit(0);
}
test();
