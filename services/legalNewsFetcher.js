const Parser = require("rss-parser");
const LegalUpdate = require("../models/LegalUpdate");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
});

const LEGAL_FEEDS = [
  { name: "SCC Online", url: "https://www.scconline.com/blog/feed/", defaultCategory: "Judgment" },
  { name: "India Legal", url: "https://www.indialegallive.com/feed/", defaultCategory: "High Court" },
  { name: "PRS Policy", url: "https://prsindia.org/rss/articles", defaultCategory: "Policy" },
];

const fetchLatestLegalNews = async () => {
  console.log(`\n--- Legal News Fetcher Started: ${new Date().toLocaleString()} ---`);

  let totalNewsFetched = 0;
  let totalDuplicatesSkipped = 0;

  for (const feed of LEGAL_FEEDS) {
    try {
      console.log(`📡 Fetching from: ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        try {
          const sourceUrl = item.link;

          // Check if already exists in MongoDB
          const existing = await LegalUpdate.findOne({ source_url: sourceUrl });
          if (existing) {
            totalDuplicatesSkipped++;
            continue;
          }

          const title = item.title;
          const summary = item.contentSnippet || item.content || "";
          const source = feed.name;
          const publishedDate = item.pubDate ? new Date(item.pubDate) : new Date();

          let category = feed.defaultCategory;
          const titleLower = title.toLowerCase();
          if (titleLower.includes("supreme court") || titleLower.includes("sc ")) category = "Supreme Court";
          else if (titleLower.includes("high court") || titleLower.includes("hc ")) category = "High Court";
          else if (titleLower.includes("bill") || titleLower.includes("act") || titleLower.includes("amendment")) category = "Amendment";

          await LegalUpdate.create({
            title,
            summary: summary.substring(0, 500),
            source,
            source_url: sourceUrl,
            category,
            published_at: publishedDate,
          });

          totalNewsFetched++;
        } catch (innerError) {}
      }
    } catch (feedError) {
      console.error(`❌ Error fetching ${feed.name}:`, feedError.message);
    }
  }

  console.log(`✅ Fetch Cycle Complete. New: ${totalNewsFetched}, Skipped: ${totalDuplicatesSkipped}`);
};

module.exports = { fetchLatestLegalNews };
