const express = require("express");
const router = express.Router();
const { filesDB, searchDB } = require("../db/database");

router.get("/", async (req, res) => {
  try {
    const allFiles = await filesDB.find({ is_duplicate: false });

    const totalFiles = allFiles.length;
    const totalSize = allFiles.reduce((sum, f) => sum + (f.size || 0), 0);

    // Group by branch
    const branchMap = {};
    const yearMap = {};
    for (const f of allFiles) {
      const b = f.branch || "Unknown";
      const y = f.year || "Unknown";
      branchMap[b] = (branchMap[b] || 0) + 1;
      yearMap[y] = (yearMap[y] || 0) + 1;
    }
    const byBranch = Object.entries(branchMap).map(([branch, cnt]) => ({ branch, cnt }));
    const byYear = Object.entries(yearMap).map(([year, cnt]) => ({ year, cnt }));

    const recentSearches = await searchDB.find({}).sort({ searched_at: -1 }).limit(5);

    res.json({ totalFiles, totalSize, byBranch, byYear, recentSearches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
