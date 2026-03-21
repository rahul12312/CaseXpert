const { recommendLawyersByAI } = require("../services/lawyerRecommendationService");

/**
 * POST /api/lawyers/ai-recommend
 * Analyzes legal issue and returns suggested lawyers
 */
exports.getAIRecommendation = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Please provide a more detailed description of your legal issue (at least 10 characters)."
            });
        }

        console.log(`🤖 AI Lawyer Matching started for: "${description.substring(0, 50)}..."`);

        const result = await recommendLawyersByAI(description);

        res.json({
            success: true,
            analysis: result.analysis,
            data: result.suggestedLawyers,
            message: `Found ${result.suggestedLawyers.length} lawyers matching your '${result.analysis.specialization}' issue.`
        });

    } catch (error) {
        console.error("AI Recommendation Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process AI recommendation. Please try manual search.",
            error: error.message
        });
    }
};
