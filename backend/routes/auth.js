const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { usersDB } = require("../db/database");

const SECRET = process.env.JWT_SECRET || "sps_secret";
const ADMIN_UN = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PW = process.env.ADMIN_PASSWORD || "admin@sps123";

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// ── Admin login ───────────────────────────────────────────────────────────────
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_UN || password !== ADMIN_PW)
    return res.status(401).json({ error: "Wrong username or password" });
  const token = makeToken({ id: "admin", name: "Admin", role: "admin" });
  res.json({ token, user: { id: "admin", name: "Admin", role: "admin" } });
});

// ── Teacher login ─────────────────────────────────────────────────────────────
router.post("/teacher/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usersDB.findOne({
      username: username.toLowerCase(),
      role: "teacher",
    });
    if (!user) return res.status(401).json({ error: "Teacher not found" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Wrong password" });
    const token = makeToken({
      id: user._id,
      name: user.name,
      username: user.username,
      role: "teacher",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: "teacher",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Student register ──────────────────────────────────────────────────────────
router.post("/student/register", async (req, res) => {
  try {
    const { name, email, branch, semester, rollNo } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email required" });
    const exists = await usersDB.findOne({
      email: email.toLowerCase(),
      role: "student",
    });
    if (exists)
      return res.status(400).json({ error: "Email already registered" });
    const doc = {
      _id: uuidv4(),
      name,
      email: email.toLowerCase(),
      role: "student",
      branch: branch || "MCA",
      semester: semester || "1st Sem",
      rollNo: rollNo || "",
      createdAt: new Date().toISOString(),
    };
    await usersDB.insert(doc);
    const token = makeToken({
      id: doc._id,
      name: doc.name,
      role: "student",
      branch: doc.branch,
      semester: doc.semester,
    });
    res.json({
      token,
      user: {
        id: doc._id,
        name: doc.name,
        role: "student",
        branch: doc.branch,
        semester: doc.semester,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Student login (email only, no password) ───────────────────────────────────
router.post("/student/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const user = await usersDB.findOne({
      email: email.toLowerCase(),
      role: "student",
    });
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found. Please register first." });
    const token = makeToken({
      id: user._id,
      name: user.name,
      role: "student",
      branch: user.branch,
      semester: user.semester,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: "student",
        branch: user.branch,
        semester: user.semester,
        rollNo: user.rollNo,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
