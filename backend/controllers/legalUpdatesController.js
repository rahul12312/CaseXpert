const { getDatabase } = require('../config/database');
const governmentNewsService = require('../services/governmentNewsService');

// Get all legal news with optional filtering
exports.getLegalNews = async (req, res) => {
    try {
        const { category, limit, refresh } = req.query;
        
        // Fetch real-time news from government API/RSS
        const allNews = await governmentNewsService.getLatestNews(refresh === 'true');
        
        let filteredNews = [...allNews];

        // Apply filtering
        if (category && category !== 'All') {
            filteredNews = filteredNews.filter(item => 
                item.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Apply limit
        if (limit) {
            filteredNews = filteredNews.slice(0, parseInt(limit));
        }

        res.status(200).json({
            success: true,
            count: filteredNews.length,
            data: filteredNews,
            isRealTime: true,
            source: 'Government Official Sources (PIB)'
        });
    } catch (error) {
        console.error('Error fetching legal news:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch real-time legal news' });
    }
};

// Get all legal videos with optional filtering
exports.getLegalVideos = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) throw new Error('Database not connected');

        const { category, limit } = req.query;
        let query = 'SELECT * FROM legal_videos';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY published_date DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const [results] = await db.execute(query, params);

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error fetching legal videos:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch legal videos' });
    }
};

// Add a new legal news item (Admin only - placeholder for now)
exports.addLegalNews = async (req, res) => {
    try {
        const db = getDatabase();
        const { title, summary, source, source_url, category, published_date } = req.body;

        await db.execute(
            'INSERT INTO legal_news (title, summary, source, source_url, category, published_date) VALUES (?, ?, ?, ?, ?, ?)',
            [title, summary, source, source_url, category, published_date || new Date()]
        );

        res.status(201).json({ success: true, message: 'Legal news added successfully' });
    } catch (error) {
        console.error('Error adding legal news:', error);
        res.status(500).json({ success: false, message: 'Failed to add legal news' });
    }
};
