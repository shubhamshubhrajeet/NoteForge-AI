const express = require("express");
const router = express.Router();
const { filesDB, searchDB } = require("../db/database");

router.get("/debug", async (req, res) => {
  const all = await filesDB.find({});
  res.json({
    total: all.length,
    files: all.map((f) => ({
      id: f._id,
      name: f.original_name,
      branch: f.branch,
      semester: f.semester,
      subject: f.subject,
      unit: f.unit,
      is_duplicate: f.is_duplicate,
    })),
  });
});

// All MCA subjects with their keywords
const SUBJECTS = [
  {
    name: "Discrete Mathematical Structure",
    keys: ["discrete", "dms", "mathematical structure"],
  },
  { name: "Operating System", keys: ["operating system", "os"] },
  { name: "Data Structure using C", keys: ["data structure", "dsa"] },
  {
    name: "Computer Organization and Architecture",
    keys: ["computer organization", "coa", "computer architecture"],
  },
  {
    name: "Universal Human Values",
    keys: ["human values", "uhv", "universal human"],
  },
  { name: "Communicative English", keys: ["communicative english", "english"] },
  {
    name: "Linear Algebra and Numerical Optimization",
    keys: ["linear algebra", "numerical", "lano"],
  },
  { name: "Computer Network", keys: ["computer network", "networking"] },
  {
    name: "Object Oriented Programming",
    keys: ["object oriented", "oop", "oops"],
  },
  { name: "Database System", keys: ["database", "dbms"] },
  {
    name: "Cyber Security",
    keys: ["cyber security", "cybersecurity", "cyber"],
  },
  { name: "Python Programming", keys: ["python"] },
  {
    name: "Design and Analysis of Algorithm",
    keys: ["algorithm", "daa", "design and analysis"],
  },
  {
    name: "AI and Machine Learning",
    keys: ["machine learning", "artificial intelligence", "ai ml"],
  },
  { name: "Internet of Things", keys: ["internet of things", "iot"] },
  {
    name: "Software Engineering",
    keys: ["software engineering", "software eng"],
  },
  {
    name: "Advanced Java Programming",
    keys: ["advanced java", "java programming"],
  },
  { name: "Cloud Computing", keys: ["cloud computing", "cloud"] },
];

function findSubject(query) {
  const q = query.toLowerCase();
  let best = null,
    bestLen = 0;
  for (const s of SUBJECTS) {
    for (const k of s.keys) {
      if (q.includes(k) && k.length > bestLen) {
        best = s.name;
        bestLen = k.length;
      }
    }
  }
  return best ? { name: best, matchLen: bestLen } : null;
}

function findUnit(query) {
  const m = query.match(/unit\s*([1-5])/i);
  return m ? `Unit ${m[1]}` : null;
}

function findBranch(query) {
  const q = query.toLowerCase();
  if (/\bmca\b/.test(q)) return "MCA";
  if (/\bbca\b/.test(q)) return "BCA";
  if (/\bbsc\b|\bitm\b/.test(q)) return "BSc_ITM";
  return null;
}

// Check if two subject strings refer to the same subject
function subjectMatches(fileSubject, searchSubject) {
  if (!fileSubject || !searchSubject) return false;
  const a = fileSubject.toLowerCase();
  const b = searchSubject.toLowerCase();
  if (a === b) return true;
  // Check significant word overlap (ignore common words)
  const stop = new Set(["and", "the", "of", "a", "an", "using", "for", "in"]);
  const aWords = a.split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
  const bWords = b.split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
  const overlap = aWords.filter((w) =>
    bWords.some((bw) => bw.includes(w) || w.includes(bw)),
  );
  // Need majority of the shorter list to match
  const minLen = Math.min(aWords.length, bWords.length);
  return overlap.length >= Math.ceil(minLen * 0.6);
}

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  console.log(`\n[SEARCH] "${q}"`);

  try {
    const allFiles = await filesDB.find({});
    const active = allFiles.filter((f) => !f.is_duplicate);

    const branch = findBranch(q);
    const subInfo = findSubject(q);
    const unit = findUnit(q);

    console.log(
      `[SEARCH] branch=${branch} subject=${subInfo?.name} unit=${unit}`,
    );

    let results = [];
    let explanation = "";

    if (subInfo || unit) {
      // Filter strictly by each detected field
      results = active.filter((f) => {
        // Branch must match if detected
        if (branch && f.branch !== branch) return false;
        // Subject must match if detected
        if (subInfo && !subjectMatches(f.subject, subInfo.name)) return false;
        // Unit must match if detected
        if (unit && f.unit !== unit) return false;
        return true;
      });

      if (results.length > 0) {
        explanation = `Found ${results.length} note${results.length !== 1 ? "s" : ""} for "${q}"`;
      } else {
        let what = "";
        if (subInfo && unit) what = `${subInfo.name} — ${unit}`;
        else if (subInfo) what = subInfo.name;
        else if (unit) what = unit;
        const where = branch ? ` in ${branch}` : "";
        explanation = `📭 No notes available for ${what}${where} yet. Please ask your teacher to upload notes.`;
      }
    } else {
      // Generic search — any word match
      const words = q
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 2);
      results = active.filter((f) => {
        const hay = [
          f.original_name,
          f.branch,
          f.semester,
          f.subject,
          f.unit,
          f.remarks,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return words.some((w) => hay.includes(w));
      });
      explanation =
        results.length > 0
          ? `Found ${results.length} file${results.length !== 1 ? "s" : ""} for "${q}"`
          : `📭 No notes found for "${q}". Try searching a subject name like "software engineering unit 2".`;
    }

    console.log(`[SEARCH] Result: ${results.length} | ${explanation}`);

    await searchDB
      .insert({
        query: q,
        results: results.length,
        searched_at: new Date().toISOString(),
      })
      .catch(() => {});
    res.json({ results, explanation, total: results.length });
  } catch (err) {
    console.error("[SEARCH]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
