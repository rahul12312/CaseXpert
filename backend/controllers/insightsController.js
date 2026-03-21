const { getDatabase } = require('../config/database');
const { Groq } = require('groq-sdk');
const { PROMPTS } = require('../services/aiPrompts');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.getAIInsights = async (req, res) => {
    const db = getDatabase();
    const userId = req.user.id;
    const role = req.user.user_type || req.user.role;

    try {
        console.log(`🧠 [DEBUG] Generating AI Insights for ${role} (ID: ${userId})`);

        // 1. Data Aggregation based on Role
        let metrics = {};

        if (role === 'admin') {
            metrics = await getAdminMetrics(db);
        } else if (role === 'lawyer') {
            metrics = await getLawyerMetrics(db, userId);
        } else {
            metrics = await getUserMetrics(db, userId);
        }

        // 2. AI Processing
        const prompt = PROMPTS.LEGAL_INSIGHTS;
        const inputData = JSON.stringify({ role, metrics });

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: `Generate insights for the following data: ${inputData}` }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        // Handle possible JSON parsing issues from AI
        let insights = [];
        try {
            const rawContent = completion.choices[0].message.content;
            const parsed = JSON.parse(rawContent);
            insights = parsed.insights || parsed; // AI might return { "insights": [] } or just []
            if (!Array.isArray(insights)) insights = [insights];
        } catch (e) {
            console.error('❌ AI JSON Parsing Error:', e);
            insights = [{
                category: 'health',
                severity: 'info',
                content: 'Platform is stable. AI analysis encountered a formatting issue but data is safe.',
                action: 'Check back later for deeper analysis.'
            }];
        }

        // 3. Cache/Save to DB (Optional, but requirement was to show persistence)
        // Clear old insights and save new ones
        await db.execute('DELETE FROM ai_insights WHERE user_id = ? AND role = ?', [userId, role]);

        for (const insight of insights) {
            await db.execute(
                'INSERT INTO ai_insights (user_id, role, category, severity, content, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, role, insight.category, insight.severity, insight.content]
            );
        }

        res.json({
            success: true,
            role,
            insights,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('❌ AI Insights Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate insights' });
    }
};

// --- Helper Functions ---

async function getUserMetrics(db, userId) {
    const [cases] = await db.execute('SELECT status, priority, updated_at FROM cases WHERE user_id = ?', [userId]);
    const [bookings] = await db.execute(`
        SELECT b.status, b.booking_time, l.user_id as lawyer_user_id 
        FROM bookings b
        JOIN lawyers l ON b.lawyer_id = l.id
        WHERE b.user_id = ?
    `, [userId]);

    return {
        totalCases: cases.length,
        caseStatuses: cases.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {}),
        totalBookings: bookings.length,
        bookingStatuses: bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {}),
        lastCaseUpdate: cases.length > 0 ? cases[0].updated_at : null
    };
}

async function getLawyerMetrics(db, userId) {
    const [lawyers] = await db.execute('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
    if (lawyers.length === 0) return {};
    const lawyerId = lawyers[0].id;

    const [bookings] = await db.execute('SELECT status, duration, created_at FROM bookings WHERE lawyer_id = ?', [lawyerId]);
    const [cases] = await db.execute('SELECT status, priority FROM cases WHERE lawyer_id = ?', [lawyerId]);

    return {
        totalRequests: bookings.length,
        acceptanceRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100 : 0,
        avgDuration: bookings.filter(b => b.duration).reduce((sum, b) => sum + b.duration, 0) / (bookings.filter(b => b.duration).length || 1),
        activeCases: cases.filter(c => c.status !== 'closed').length,
        caseLoad: cases.length
    };
}

async function getAdminMetrics(db) {
    const [totalUsers] = await db.execute('SELECT count(*) as count FROM users');
    const [totalLawyers] = await db.execute('SELECT count(*) as count FROM lawyers');
    const [totalBookings] = await db.execute('SELECT status FROM bookings');
    const [totalCases] = await db.execute('SELECT status FROM cases');

    return {
        platformUsers: totalUsers[0].count,
        platformLawyers: totalLawyers[0].count,
        bookingSuccessRate: totalBookings.length > 0 ? (totalBookings.filter(b => b.status === 'completed').length / totalBookings.length) * 100 : 0,
        activeCases: totalCases.filter(c => c.status !== 'closed').length
    };
}
