const LegalUpdate = require("../models/LegalUpdate");
const LegalVideo = require("../models/LegalVideo");
const governmentNewsService = require("../services/governmentNewsService");

// Get all legal news with optional filtering
exports.getLegalNews = async (req, res) => {
  try {
    const { category, limit, refresh } = req.query;
    const allNews = await governmentNewsService.getLatestNews(refresh === "true");
    let filteredNews = [...allNews];

    if (category && category !== "All") {
      filteredNews = filteredNews.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (limit) filteredNews = filteredNews.slice(0, parseInt(limit));

    return res.json({
      success: true,
      count: filteredNews.length,
      data: filteredNews,
      source: "Government Official Sources (PIB)",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch legal news" });
  }
};

// Get all legal videos with optional filtering
exports.getLegalVideos = async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const query = LegalVideo.find(filter).sort({ published_date: -1 });
    if (limit) query.limit(parseInt(limit));

    const results = await query;
    return res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch legal videos" });
  }
};

// Add a new legal news item (Admin)
exports.addLegalNews = async (req, res) => {
  try {
    const { title, summary, source, source_url, category, published_date } = req.body;
    await LegalUpdate.create({ title, summary, source, source_url, category, published_at: published_date || Date.now() });
    return res.status(201).json({ success: true, message: "Legal news added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add legal news" });
  }
};
