const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { usersDB } = require("../db/database");
const auth = require("../middleware/auth");

const isAdmin = auth(["admin"]);

// Create teacher
router.post("/teachers", isAdmin, async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    if (!name || !username || !password)
      return res
        .status(400)
        .json({ error: "Name, username and password required" });
    const exists = await usersDB.findOne({ username: username.toLowerCase() });
    if (exists)
      return res.status(400).json({ error: "Username already taken" });
    const doc = {
      _id: uuidv4(),
      name,
      email: email || "",
      phone: phone || "",
      username: username.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      plainPassword: password,
      role: "teacher",
      createdAt: new Date().toISOString(),
    };
    await usersDB.insert(doc);
    const { password: _, ...safe } = doc;
    res.json({ success: true, teacher: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List teachers
router.get("/teachers", isAdmin, async (req, res) => {
  try {
    const list = await usersDB.find({ role: "teacher" });
    res.json(list.map(({ password, ...t }) => t));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update teacher
router.patch("/teachers/:id", isAdmin, async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;
    if (username) update.username = username.toLowerCase();
    if (password) {
      update.password = await bcrypt.hash(password, 10);
      update.plainPassword = password;
    }
    await usersDB.update({ _id: req.params.id }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete teacher
router.delete("/teachers/:id", isAdmin, async (req, res) => {
  try {
    await usersDB.remove({ _id: req.params.id, role: "teacher" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List students
router.get("/students", isAdmin, async (req, res) => {
  try {
    const list = await usersDB.find({ role: "student" });
    res.json(list.map(({ password, ...s }) => s));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete("/students/:id", isAdmin, async (req, res) => {
  try {
    await usersDB.remove({ _id: req.params.id, role: "student" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Update student details (branch, semester, rollNo, name)
router.patch("/students/:id", isAdmin, async (req, res) => {
  try {
    const { name, branch, semester, rollNo } = req.body;
    const update = {};
    if (name) update.name = name;
    if (branch) update.branch = branch;
    if (semester) update.semester = semester;
    if (rollNo !== undefined) update.rollNo = rollNo;
    await usersDB.update({ _id: req.params.id }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
