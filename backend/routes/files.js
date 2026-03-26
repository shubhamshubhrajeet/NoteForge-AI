const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const upload = require("../middleware/upload");
const { filesDB } = require("../db/database");
const {
  computeFileHash,
  extractTextContent,
  deleteFileFromDisk,
} = require("../services/fileService");
const { categorizeFile } = require("../services/aiService");

router.post("/upload", upload.array("files", 20), async (req, res) => {
  try {
    const results = [];
    const remarks = req.body.remarks || "";
    const hints = {
      branch: req.body.hint_branch || "",
      semester: req.body.hint_semester || "",
      subject: req.body.hint_subject || "",
      unit: req.body.hint_unit || "",
    };

    for (const file of req.files) {
      const hash = await computeFileHash(file.path);

      const existing = await filesDB.findOne({ hash });
      if (existing) {
        results.push({
          id: uuidv4(),
          original_name: file.originalname,
          status: "duplicate",
          duplicate_of: existing._id,
          duplicate_of_name: existing.original_name,
        });
        deleteFileFromDisk(file.path);
        continue;
      }

      const textContent = await extractTextContent(file.path, file.mimetype);

      let category = {
        branch: "Unknown",
        semester: "Unknown",
        subject: "Unknown",
        unit: "Unknown",
        tags: [],
        summary: "",
      };
      try {
        category = await categorizeFile(
          file.originalname,
          textContent,
          remarks,
          hints,
        );
      } catch (aiErr) {
        console.warn("AI categorization failed:", aiErr.message);
      }

      // Check if unit already has a note (1 per unit rule)
      let unitConflict = null;
      if (
        category.branch !== "Unknown" &&
        category.semester !== "Unknown" &&
        category.subject !== "Unknown" &&
        category.unit !== "Unknown"
      ) {
        unitConflict = await filesDB.findOne({
          branch: category.branch,
          semester: category.semester,
          subject: category.subject,
          unit: category.unit,
          is_duplicate: false,
        });
      }

      const id = uuidv4();
      const doc = {
        _id: id,
        original_name: file.originalname,
        stored_name: file.filename,
        file_path: file.path,
        size: file.size,
        mime_type: file.mimetype,
        hash,
        branch: category.branch || "Unknown",
        semester: category.semester || "Unknown",
        year: category.semester || "Unknown", // keep year for compatibility
        subject: category.subject || "Unknown",
        unit: category.unit || "Unknown",
        tags: category.tags || [],
        summary: category.summary || "",
        remarks: remarks,
        uploaded_at: new Date().toISOString(),
        is_duplicate: false,
      };

      await filesDB.insert(doc);
      results.push({
        id,
        original_name: file.originalname,
        status: "uploaded",
        category,
        unit_conflict: unitConflict ? unitConflict.original_name : null,
      });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { branch, semester, year, subject, page = 1, limit = 20 } = req.query;
    const query = { is_duplicate: false };
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    else if (year) query.semester = year;
    if (subject) query.subject = new RegExp(subject, "i");

    const allFiles = await filesDB.find(query).sort({ uploaded_at: -1 });
    const total = allFiles.length;
    const p = parseInt(page),
      l = parseInt(limit);
    const files = allFiles.slice((p - 1) * l, p * l);
    res.json({ files, total, page: p, limit: l });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tree", async (req, res) => {
  try {
    const allFiles = await filesDB.find({ is_duplicate: false });
    const tree = {};
    for (const f of allFiles) {
      const b = f.branch || "Unknown";
      const s = f.semester || f.year || "Unknown";
      const sub = f.subject || "Unknown";
      if (!tree[b]) tree[b] = {};
      if (!tree[b][s]) tree[b][s] = {};
      tree[b][s][sub] = (tree[b][s][sub] || 0) + 1;
    }
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const file = await filesDB.findOne({ _id: req.params.id });
    if (!file) return res.status(404).json({ error: "File not found" });
    deleteFileFromDisk(file.file_path);
    await filesDB.remove({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { branch, semester, subject, unit, tags } = req.body;
    await filesDB.update(
      { _id: req.params.id },
      { $set: { branch, semester, subject, unit, tags: tags || [] } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
