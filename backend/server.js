require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const storagePath = path.resolve(process.env.STORAGE_PATH || "./uploads");

if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(storagePath));

// Download by file ID
app.get("/api/download/:id", async (req, res) => {
  try {
    const { filesDB } = require("./db/database");
    const file = await filesDB.findOne({ _id: req.params.id });
    if (!file) return res.status(404).json({ error: "File not found" });
    const fp = file.file_path;
    if (!fp || !fs.existsSync(fp))
      return res.status(404).json({ error: "File missing on disk" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
    );
    res.sendFile(path.resolve(fp));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/files", require("./routes/files"));
app.use("/api/search", require("./routes/search"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/stats", require("./routes/stats"));

app.use("/api/videos", require("./routes/videos"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🎓 College Notes VPS — School of Professional Studies`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Storage: ${storagePath}\n`);
});
