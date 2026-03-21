const { askAiLegalAssistant } = require("./aiLegalAssistantGroq");
const { getDatabase } = require("../config/database");

/**
 * Recommends lawyers based on user problem description
 * 1. Uses AI to categorize the issue
 * 2. Queries DB for matching lawyers
 */
exports.recommendLawyersByAI = async (problemDescription) => {
    try {
        const db = getDatabase();

        // 1. Ask AI to analyze the issue
        const messages = [
            { role: "user", content: `My legal issue is: ${problemDescription}` }
        ];

        console.log("--------------------------------------------------");
        console.log("🤖 AI LAWYER MATCHING: PROMPT SENT");

        const { reply } = await askAiLegalAssistant(messages, "RECOMMENDATION");

        let aiAnalysis;
        try {
            const jsonStr = reply.replace(/```json|```/g, "").trim();
            aiAnalysis = JSON.parse(jsonStr);
            console.log("✅ AI ANALYSIS SUCCESSFUL:");
            console.log(`   - SPECIALIZATION: ${aiAnalysis.specialization}`);
            console.log(`   - KEYWORDS: ${aiAnalysis.keywords.join(', ')}`);
            console.log(`   - EXP LEVEL: ${aiAnalysis.experience_level}`);
            console.log(`   - CITY: ${aiAnalysis.city || 'Any'}`);
        } catch (e) {
            console.error("❌ Failed to parse AI response. Raw reply:", reply);
            throw new Error("AI could not categorize the issue properly.");
        }

        // 2. Query Database based on AI Analysis
        // We match by:
        // - Specialization (Primary)
        // - Keywords in Bio or Practice Areas (Secondary)
        // - Experience level filter

        let expMin = 0;
        let expMax = 100;
        if (aiAnalysis.experience_level === 'junior') { expMax = 5; }
        else if (aiAnalysis.experience_level === 'mid') { expMin = 5; expMax = 15; }
        else if (aiAnalysis.experience_level === 'senior') { expMin = 10; }

        const sql = `
            SELECT 
                l.id,
                l.user_id,
                u.name,
                u.profile_image,
                l.specialization,
                l.experience,
                l.consultation_fee,
                l.bio,
                l.city,
                l.rating as average_rating,
                l.total_cases
            FROM lawyers l
            INNER JOIN users u ON l.user_id = u.id
            WHERE u.is_active = 1 
            AND l.license_verified = 1
            AND (
                l.specialization LIKE ? 
                OR l.specialization LIKE ?
                OR l.bio LIKE ?
                OR l.bio LIKE ?
                ${aiAnalysis.keywords.map(() => "OR l.bio LIKE ? OR l.specialization LIKE ?").join(" ")}
            )
            ORDER BY 
                (CASE WHEN l.city LIKE ? THEN 50 ELSE 0 END) +
                (CASE WHEN l.specialization LIKE ? THEN 20 ELSE 0 END) +
                (CASE WHEN l.specialization LIKE ? THEN 5 ELSE 0 END) +
                (l.rating * 5) +
                (l.experience / 2) DESC
            LIMIT 5
        `;

        const specSearch = `%${aiAnalysis.specialization}%`;
        const specShort = `%${aiAnalysis.specialization.split(' ')[0]}%`;
        const citySearch = `%${aiAnalysis.city || ''}%`;

        const queryParams = [specSearch, specShort, specSearch, specShort];

        // Add individual keywords to search
        aiAnalysis.keywords.forEach(kw => {
            queryParams.push(`%${kw}%`, `%${kw}%`);
        });

        // Add params for ordering boost (City first, then Spec)
        queryParams.push(citySearch, specSearch, specShort);

        console.log(`📡 QUERYING DATABASE FOR: ${aiAnalysis.specialization} IN ${aiAnalysis.city || 'India'}...`);
        const [lawyers] = await db.query(sql, queryParams);

        console.log(`✅ MATCH FOUND: ${lawyers.length} lawyers`);
        lawyers.forEach((l, idx) => {
            console.log(`   [${idx + 1}] ${l.name} (${l.specialization}) - Rating: ${l.average_rating}`);
        });
        console.log("--------------------------------------------------");

        // 3. Fallback if no specific matches found
        if (lawyers.length === 0) {
            console.log("⚠️ No specific matches found. Fetching top verified lawyers as fallback.");
            const fallbackSql = `
                SELECT l.id, l.user_id, u.name, u.profile_image, l.specialization, l.experience, l.consultation_fee, l.bio, l.city, l.rating as average_rating, l.total_cases
                FROM lawyers l
                INNER JOIN users u ON l.user_id = u.id
                WHERE u.is_active = 1 AND l.license_verified = 1
                ORDER BY l.rating DESC, l.experience DESC
                LIMIT 3
            `;
            const [fallbackLawyers] = await db.query(fallbackSql);
            return {
                analysis: { ...aiAnalysis, summary: "No exact match found. Showing top verified experts." },
                suggestedLawyers: fallbackLawyers
            };
        }

        return {
            analysis: aiAnalysis,
            suggestedLawyers: lawyers
        };

    } catch (error) {
        console.error("❌ Lawyer Recommendation Service Error:", error);
        throw error;
    }
};
