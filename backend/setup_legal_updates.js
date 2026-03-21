const { createDatabasePool, getDatabase } = require('./config/database');

const setupLegalUpdates = async () => {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log('🔄 Setting up Legal Updates tables...');

        // 1. Create legal_news table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS legal_news (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                summary TEXT NOT NULL,
                content TEXT,
                source VARCHAR(100) NOT NULL,
                source_url VARCHAR(500),
                image_url VARCHAR(500),
                category ENUM('Supreme Court', 'High Court', 'Central Law', 'State Law', 'Amendment', 'Judgment', 'Other') NOT NULL DEFAULT 'Other',
                published_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ legal_news table ready');

        // 2. Create legal_videos table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS legal_videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                video_id VARCHAR(50) NOT NULL,
                channel_name VARCHAR(100) NOT NULL,
                view_count VARCHAR(50),
                duration VARCHAR(20),
                category ENUM('IPC', 'CrPC', 'Constitution', 'Property', 'Family', 'Corporate', 'Other') NOT NULL DEFAULT 'Other',
                published_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ legal_videos table ready');

        // 3. Seed Sample News and Videos (New Logic)
        await seedData(db);

        console.log('✅ Legal Updates setup completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

const seedData = async (db) => {
    // Clear existing data to ensure we show the latest requested content
    await db.execute('DELETE FROM legal_news');
    await db.execute('DELETE FROM legal_videos');
    console.log('🧹 Cleared existing legal updates data');

    console.log('🌱 Seeding specific legal news...');
    const newsData = [
        [
            "Supreme Court Stays Survey of Places of Worship",
            "The Supreme Court issued an interim order staying the registration of suits seeking surveys of places of worship, emphasizing the need to uphold communal harmony under the Places of Worship Act, 1991.",
            "LiveLaw",
            "https://www.livelaw.in/",
            "Supreme Court",
            "2024-12-12"
        ],
        [
            "New Criminal Laws (BNS, BNSS, BSA) Implementation Update",
            "Union Home Minister Amit Shah states that all Union Territories will be fully ready to implement the new criminal laws (Bharatiya Nyaya Sanhita, etc.) by December 2024.",
            "The Hindu",
            "https://www.thehindu.com/",
            "Amendment",
            "2024-12-05"
        ],
        [
            "Supreme Court Flags Misuse of Section 498A IPC",
            "The apex court has once again condemned the growing misuse of Section 498A (cruelty to women) for personal vendetta, quashing FIRs with vague allegations against in-laws.",
            "Bar & Bench",
            "https://www.barandbench.com/",
            "Judgment",
            "2024-12-10"
        ],
        [
            "Delhi High Court Rules on Matrimonial Cruelty",
            "A significant ruling clarifying what constitutes mental cruelty in divorce proceedings under the Hindu Marriage Act, balancing rights of both spouses.",
            "Legal India",
            "https://www.legalindia.com/",
            "High Court",
            "2024-12-08"
        ]
    ];

    for (const news of newsData) {
        await db.query(`
            INSERT INTO legal_news (title, summary, source, source_url, category, published_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, news);
    }

    console.log('🌱 Seeding specific legal videos...');
    // Using realistic placeholders or well-known IDs. 
    // "M8J8ad-sQ_E" is a placeholder format. To be safe for the demo, we use valid looking IDs.
    const videoData = [
        [
            "Basic Structure of Indian Constitution | Finology Legal",
            "0t7p6W3_j_U", // Example ID
            "Finology Legal",
            "3.5M views",
            "15:30",
            "Constitution",
            "2024-09-05"
        ],
        [
            "Understanding FIR Procedure under CrPC",
            "M8J8ad-sQ_E", // Example ID
            "Legal Eagle India",
            "1.2M views",
            "10:05",
            "CrPC",
            "2024-10-10"
        ],
        [
            "New Criminal Laws 2024 Explained",
            "j5p7x9_J1_0", // Random 11 char ID
            "Law Sikho",
            "800K views",
            "12:20",
            "Other",
            "2024-12-01"
        ],
        [
            "Property Registration Process in India",
            "3SPJUv5tL9o",
            "Cleartax",
            "500K views",
            "08:45",
            "Property",
            "2024-11-20"
        ]
    ];

    for (const video of videoData) {
        await db.query(`
            INSERT INTO legal_videos (title, video_id, channel_name, view_count, duration, category, published_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, video);
    }
};

setupLegalUpdates();
