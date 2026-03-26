const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const STORAGE_PATH = path.resolve(process.env.STORAGE_PATH || "./uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateFolder = new Date().toISOString().split("T")[0];
    const dest = path.join(STORAGE_PATH, dateFolder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "_" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type " + file.mimetype + " not allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;
