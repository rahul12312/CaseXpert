const Parser = require('rss-parser');
const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 15000 // 15 seconds timeout
});

// Official and Reliable Legal News RSS feeds
const NEWS_SOURCES = [
    {
        name: 'PIB - Law & Justice',
        url: 'https://pib.gov.in/RssMain.aspx?ModId=6&LangId=1',
        category: 'Central Law',
        isOfficial: true
    },
    {
        name: 'LiveLaw',
        url: 'https://www.livelaw.in/rss/feed',
        category: 'High Court',
        isOfficial: false
    },
    {
        name: 'Bar & Bench',
        url: 'https://www.barandbench.com/rss/feed',
        category: 'Supreme Court',
        isOfficial: false
    }
];

// Simple in-memory cache
let newsCache = {
    data: [],
    lastFetched: null,
    ttl: 15 * 60 * 1000 // 15 minutes
};

/**
 * Fetch latest news from official government RSS feeds
 */
const getLatestNews = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && newsCache.lastFetched && (now - newsCache.lastFetched < newsCache.ttl)) {
        console.log('📦 Returning news from in-memory cache');
        return newsCache.data;
    }

    console.log('📡 Fetching real-time news from official government sources...');
    let allNews = [];

    for (const source of NEWS_SOURCES) {
        try {
            console.log(`🔍 Fetching: ${source.name}`);
            const feed = await parser.parseURL(source.url);
            
            const items = feed.items.map(item => {
                // Determine category based on title keywords
                let category = source.category;
                const titleLower = item.title.toLowerCase();
                if (titleLower.includes('supreme court') || titleLower.includes('court')) category = 'Supreme Court';
                else if (titleLower.includes('amendment') || titleLower.includes('bill')) category = 'Amendment';
                else if (titleLower.includes('high court')) category = 'High Court';

                return {
                    id: item.guid || item.link,
                    title: item.title,
                    summary: item.contentSnippet || item.content || 'Click to read full article.',
                    source: 'Press Information Bureau (Govt of India)',
                    source_url: item.link,
                    category: category,
                    published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
                    timestamp: item.isoDate || new Date().toISOString()
                };
            });

            allNews = [...allNews, ...items];
        } catch (error) {
            console.error(`❌ Failed to fetch from ${source.name}:`, error.message);
        }
    }

    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

    // Update cache
    newsCache.data = allNews;
    newsCache.lastFetched = now;

    return allNews;
};

module.exports = {
    getLatestNews
};
