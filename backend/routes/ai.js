const express = require("express");
const router = express.Router();
const { filesDB } = require("../db/database");
const {
  checkSemanticDuplicate,
  categorizeFile,
} = require("../services/aiService");
const { deleteFileFromDisk } = require("../services/fileService");

// Re-categorize single file — pass stored remarks so fuzzy parser can work
router.post("/recategorize/:id", async (req, res) => {
  try {
    const file = await filesDB.findOne({ _id: req.params.id });
    if (!file) return res.status(404).json({ error: "File not found" });

    // Use stored remarks + any hints from request body
    const remarks = req.body.remarks || file.remarks || "";
    const hints = req.body.hints || {};

    console.log(
      `[RECATEGORIZE] File: ${file.original_name} | Remarks: "${remarks}"`,
    );

    const category = await categorizeFile(
      file.original_name,
      null,
      remarks,
      hints,
    );

    await filesDB.update(
      { _id: req.params.id },
      {
        $set: {
          branch: category.branch,
          semester: category.semester,
          year: category.semester,
          subject: category.subject,
          unit: category.unit,
          tags: category.tags || [],
          summary: category.summary || "",
        },
      },
    );

    res.json({ success: true, category });
  } catch (err) {
    console.error("Recategorize error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fix ALL unknown files using their stored remarks
router.post("/fix-unknown", async (req, res) => {
  try {
    const unknownFiles = await filesDB.find({
      $or: [
        { branch: "Unknown" },
        { subject: "Unknown" },
        { unit: "Unknown" },
        { branch: { $exists: false } },
      ],
      is_duplicate: false,
    });

    console.log(`[FIX-UNKNOWN] Found ${unknownFiles.length} files to fix`);
    const results = [];

    for (const file of unknownFiles) {
      const remarks = file.remarks || "";
      if (!remarks) {
        results.push({
          id: file._id,
          name: file.original_name,
          status: "skipped",
          reason: "no remarks stored",
        });
        continue;
      }

      try {
        const category = await categorizeFile(
          file.original_name,
          null,
          remarks,
          {},
        );
        if (category.subject !== "Unknown" || category.branch !== "Unknown") {
          await filesDB.update(
            { _id: file._id },
            {
              $set: {
                branch: category.branch,
                semester: category.semester,
                year: category.semester,
                subject: category.subject,
                unit: category.unit,
                tags: category.tags || [],
                summary: category.summary || "",
              },
            },
          );
          results.push({
            id: file._id,
            name: file.original_name,
            status: "fixed",
            category,
          });
          console.log(
            `[FIX-UNKNOWN] Fixed: ${file.original_name} → ${category.branch} / ${category.subject} / ${category.unit}`,
          );
        } else {
          results.push({
            id: file._id,
            name: file.original_name,
            status: "still-unknown",
            remarks,
          });
        }
      } catch (e) {
        results.push({
          id: file._id,
          name: file.original_name,
          status: "error",
          error: e.message,
        });
      }
    }

    const fixed = results.filter((r) => r.status === "fixed").length;
    res.json({ success: true, total: unknownFiles.length, fixed, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find duplicates
router.get("/duplicates", async (req, res) => {
  try {
    const files = await filesDB.find({ is_duplicate: false });
    const duplicatePairs = [];
    const groups = {};
    for (const f of files) {
      const key = `${f.branch}_${f.semester}_${f.subject}_${f.unit}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    }
    for (const group of Object.values(groups)) {
      if (group.length < 2) continue;
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          try {
            const result = await checkSemanticDuplicate(group[i], group[j]);
            if (result.is_duplicate)
              duplicatePairs.push({
                file1: group[i],
                file2: group[j],
                confidence: result.confidence,
                reason: result.reason,
              });
          } catch (e) {}
        }
      }
    }
    res.json({ duplicates: duplicatePairs, total: duplicatePairs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve duplicate
router.post("/duplicates/resolve", async (req, res) => {
  try {
    const { keep_id, delete_id } = req.body;
    const file = await filesDB.findOne({ _id: delete_id });
    if (!file) return res.status(404).json({ error: "File not found" });
    deleteFileFromDisk(file.file_path);
    await filesDB.remove({ _id: delete_id });
    res.json({ success: true, kept: keep_id, deleted: delete_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
