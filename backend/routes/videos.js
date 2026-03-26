const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { videosDB, commentsDB } = require("../db/database");

const STORAGE = path.resolve(process.env.STORAGE_PATH || "./uploads");
const VIDEO_DIR = path.join(STORAGE, "videos");
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
  },
});
const videoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "video/mp4",
      "video/mpeg",
      "video/avi",
      "video/quicktime",
      "video/webm",
      "video/x-matroska",
      "video/x-msvideo",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".mpeg"];
    if (allowed.includes(file.mimetype) || allowedExt.includes(ext))
      cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

// Serve video files by stored name
router.get("/stream/:filename", (req, res) => {
  const fp = path.join(VIDEO_DIR, req.params.filename);
  if (!fs.existsSync(fp))
    return res.status(404).json({ error: "Video not found" });
  const stat = fs.statSync(fp);
  const range = req.headers.range;
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunk = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunk,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(fp, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(fp).pipe(res);
  }
});

// Upload video
router.post(
  "/upload",
  videoUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const vFile = req.files?.video?.[0];
      const tFile = req.files?.thumbnail?.[0];
      if (!vFile) return res.status(400).json({ error: "Video file required" });
      const {
        title,
        description,
        subject,
        branch,
        semester,
        unit,
        externalLinks,
      } = req.body;
      if (!title) return res.status(400).json({ error: "Title required" });

      const doc = {
        _id: uuidv4(),
        title,
        description: description || "",
        subject: subject || "",
        branch: branch || "",
        semester: semester || "",
        unit: unit || "",
        externalLinks: externalLinks ? JSON.parse(externalLinks) : [],
        videoFile: vFile.filename,
        videoPath: vFile.path,
        videoSize: vFile.size,
        thumbnailFile: tFile?.filename || null,
        uploadedBy: req.body.teacherName || "Teacher",
        teacherId: req.body.teacherId || "",
        views: 0,
        uploadedAt: new Date().toISOString(),
      };
      await videosDB.insert(doc);
      res.json({ success: true, video: doc });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// List videos
router.get("/", async (req, res) => {
  try {
    const { branch, semester, subject, teacherId, q } = req.query;
    let all = await videosDB.find({});
    if (branch) all = all.filter((v) => v.branch === branch);
    if (semester) all = all.filter((v) => v.semester === semester);
    if (subject)
      all = all.filter((v) =>
        (v.subject || "").toLowerCase().includes(subject.toLowerCase()),
      );
    if (teacherId) all = all.filter((v) => v.teacherId === teacherId);
    if (q) {
      const ql = q.toLowerCase();
      all = all.filter(
        (v) =>
          (v.title || "").toLowerCase().includes(ql) ||
          (v.description || "").toLowerCase().includes(ql) ||
          (v.subject || "").toLowerCase().includes(ql) ||
          (v.branch || "").toLowerCase().includes(ql),
      );
    }
    all.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single video + increment views
router.get("/:id", async (req, res) => {
  try {
    const v = await videosDB.findOne({ _id: req.params.id });
    if (!v) return res.status(404).json({ error: "Not found" });
    await videosDB.update(
      { _id: req.params.id },
      { $set: { views: (v.views || 0) + 1 } },
    );
    res.json({ ...v, views: (v.views || 0) + 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update video details
router.patch("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      branch,
      semester,
      unit,
      externalLinks,
    } = req.body;
    const upd = {};
    if (title) upd.title = title;
    if (description !== undefined) upd.description = description;
    if (subject) upd.subject = subject;
    if (branch) upd.branch = branch;
    if (semester) upd.semester = semester;
    if (unit) upd.unit = unit;
    if (externalLinks) upd.externalLinks = JSON.parse(externalLinks);
    await videosDB.update({ _id: req.params.id }, { $set: upd });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete video
router.delete("/:id", async (req, res) => {
  try {
    const v = await videosDB.findOne({ _id: req.params.id });
    if (!v) return res.status(404).json({ error: "Not found" });
    if (v.videoPath && fs.existsSync(v.videoPath)) fs.unlinkSync(v.videoPath);
    await videosDB.remove({ _id: req.params.id });
    await commentsDB.remove({ videoId: req.params.id }, { multi: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Comments ──────────────────────────────────────────────────────────────────
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await commentsDB.find({ videoId: req.params.id });
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { text, authorName, authorRole } = req.body;
    if (!text?.trim())
      return res.status(400).json({ error: "Comment cannot be empty" });
    const doc = {
      _id: uuidv4(),
      videoId: req.params.id,
      text: text.trim(),
      authorName: authorName || "Anonymous",
      authorRole: authorRole || "student",
      createdAt: new Date().toISOString(),
    };
    await commentsDB.insert(doc);
    res.json({ success: true, comment: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:videoId/comments/:commentId", async (req, res) => {
  try {
    await commentsDB.remove({ _id: req.params.commentId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Add reply to a comment
router.post("/:videoId/comments/:commentId/reply", async (req, res) => {
  try {
    const { text, authorName } = req.body;
    if (!text?.trim())
      return res.status(400).json({ error: "Reply cannot be empty" });
    const comment = await commentsDB.findOne({ _id: req.params.commentId });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    const replies = comment.replies || [];
    replies.push({
      id: require("uuid").v4(),
      text: text.trim(),
      authorName: authorName || "Teacher",
      authorRole: "teacher",
      createdAt: new Date().toISOString(),
    });
    await commentsDB.update(
      { _id: req.params.commentId },
      { $set: { replies } },
    );
    res.json({ success: true, replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a reply
router.delete(
  "/:videoId/comments/:commentId/reply/:replyId",
  async (req, res) => {
    try {
      const comment = await commentsDB.findOne({ _id: req.params.commentId });
      if (!comment) return res.status(404).json({ error: "Not found" });
      const replies = (comment.replies || []).filter(
        (r) => r.id !== req.params.replyId,
      );
      await commentsDB.update(
        { _id: req.params.commentId },
        { $set: { replies } },
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);
