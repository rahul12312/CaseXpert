const { getDatabase, createDatabasePool } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const LEGAL_VIDEOS = [
    {
        title: "Introduction to Indian Penal Code (IPC) - Basic Concepts",
        video_id: "H6uV7_p7XRE",
        summary: "Learn the fundamentals of the Indian Penal Code, its history, and how it governs criminal law in India.",
        category: "IPC",
        duration: "12:45",
        channel_name: "Legal Awareness",
        view_count: "45K"
    },
    {
        title: "Constitution of India: Fundamental Rights Explained",
        video_id: "0fV0m2wN1iQ",
        summary: "A detailed breakdown of Article 14 to 32, exploring the core protections every citizen has in India.",
        category: "Constitution",
        duration: "18:20",
        channel_name: "Know Your Rights",
        view_count: "120K"
    },
    {
        title: "Understanding Property Laws in India",
        video_id: "W_Yp-m_8E_M",
        summary: "Important considerations for buying property, land laws, and the Real Estate Regulatory Authority (RERA).",
        category: "Property",
        duration: "15:10",
        channel_name: "Property Legal",
        view_count: "32K"
    },
    {
        title: "Company Law Basics for Startups",
        video_id: "fXp_O6G8J9E",
        summary: "Key legal steps for registering a company, compliance, and governance for new businesses.",
        category: "Corporate",
        duration: "10:55",
        channel_name: "Startup Law India",
        view_count: "28K"
    },
    {
        title: "Matrimonial & Family Laws in India",
        video_id: "zN1-r6_unpA",
        summary: "Overview of marriage, divorce, and maintenance laws under different personal laws in India.",
        category: "Family",
        duration: "20:30",
        channel_name: "Family Legal Aid",
        view_count: "88K"
    }
];

async function seedVideos() {
    await createDatabasePool();
    const db = getDatabase();
    console.log('🎬 Seeding legal videos...');

    try {
        for (const video of LEGAL_VIDEOS) {
            await db.execute(
                'INSERT IGNORE INTO legal_videos (title, video_id, summary, category, duration, channel_name, view_count, published_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [video.title, video.video_id, video.summary, video.category, video.duration, video.channel_name, video.view_count, new Date()]
            );
        }
        console.log(`✅ Seeded ${LEGAL_VIDEOS.length} legal videos.`);
    } catch (err) {
        console.error('❌ Failed to seed videos:', err.message);
    }

    console.log('✨ Seeding complete.');
    process.exit();
}

seedVideos();
