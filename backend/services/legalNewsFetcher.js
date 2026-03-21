const Parser = require('rss-parser');
const { getDatabase } = require('../config/database');
const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
});

const LEGAL_FEEDS = [
    {
        name: 'SCC Online',
        url: 'https://www.scconline.com/blog/feed/',
        defaultCategory: 'Judgment'
    },
    {
        name: 'India Legal',
        url: 'https://www.indialegallive.com/feed/',
        defaultCategory: 'High Court'
    },
    {
        name: 'PRS Policy',
        url: 'https://prsindia.org/rss/articles',
        defaultCategory: 'Policy'
    }
];

/**
 * Fetch news from RSS feeds and store in database
 */
const fetchLatestLegalNews = async () => {
    console.log(`\n--- Legal News Fetcher Started: ${new Date().toLocaleString()} ---`);
    const db = getDatabase();
    if (!db) {
        console.error('Fetcher failed: Database not connected');
        return;
    }

    let totalNewsFetched = 0;
    let totalDuplicatesSkipped = 0;

    for (const feed of LEGAL_FEEDS) {
        try {
            console.log(`📡 Fetching from: ${feed.name}...`);
            const feedData = await parser.parseURL(feed.url);

            for (const item of feedData.items) {
                try {
                    // Extract info
                    const title = item.title;
                    const summary = item.contentSnippet || item.content || '';
                    const source = feed.name;
                    const sourceUrl = item.link;
                    const publishedDate = item.pubDate ? new Date(item.pubDate) : new Date();

                    // Basic category mapping if possible, else use default
                    let category = feed.defaultCategory;
                    const titleLower = title.toLowerCase();
                    if (titleLower.includes('supreme court') || titleLower.includes('sc ')) category = 'Supreme Court';
                    else if (titleLower.includes('high court') || titleLower.includes('hc ')) category = 'High Court';
                    else if (titleLower.includes('bill') || titleLower.includes('act') || titleLower.includes('amendment')) category = 'Amendment';

                    // Insert using IGNORE or check existence (UNIQUE constraint on source_url handles this)
                    const query = `
                        INSERT IGNORE INTO legal_news 
                        (title, summary, source, source_url, category, published_date) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    const [result] = await db.execute(query, [
                        title,
                        summary.substring(0, 500), // Limit summary length
                        source,
                        sourceUrl,
                        category,
                        publishedDate
                    ]);

                    if (result.affectedRows > 0) {
                        totalNewsFetched++;
                    } else {
                        totalDuplicatesSkipped++;
                    }
                } catch (innerError) {
                    // console.error(`Failed to process item: ${item.title}`);
                }
            }
        } catch (feedError) {
            console.error(`❌ Error fetching ${feed.name}:`, feedError.message);
        }
    }

    console.log(`✅ Fetch Cycle Complete`);
    console.log(`   - New Items: ${totalNewsFetched}`);
    console.log(`   - Duplicates Skipped: ${totalDuplicatesSkipped}`);
    console.log(`--------------------------------------------------\n`);
};

module.exports = { fetchLatestLegalNews };
