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
      remarks: f.remarks,
    })),
  });
});

// Subject list with branch-awareness to avoid cross-branch confusion
const SUBJECTS = [
  // MCA subjects
  {
    name: "Discrete Mathematical Structure",
    branch: "MCA",
    keys: [
      "discrete mathematical structure",
      "discrete math",
      "dms",
      "discrete structure",
    ],
  },
  { name: "Operating System", branch: "MCA", keys: ["operating system", "os"] },
  {
    name: "Data Structure using C",
    branch: "MCA",
    keys: ["data structure using c", "data structure", "dsa"],
  },
  {
    name: "Computer Organization and Architecture",
    branch: "MCA",
    keys: ["computer organization", "coa", "computer architecture"],
  },
  {
    name: "Universal Human Values",
    branch: "MCA",
    keys: ["universal human values", "uhv", "human values"],
  },
  {
    name: "Communicative English",
    branch: "MCA",
    keys: ["communicative english", "english communication"],
  },
  {
    name: "Linear Algebra and Numerical Optimization",
    branch: "MCA",
    keys: ["linear algebra", "numerical optimization", "lano"],
  },
  {
    name: "Computer Network",
    branch: "MCA",
    keys: ["computer network mca", "cn mca", "ca122"],
  },
  {
    name: "Object Oriented Programming",
    branch: "MCA",
    keys: ["object oriented programming mca", "oop mca", "ca123"],
  },
  {
    name: "Database System",
    branch: "MCA",
    keys: ["database system mca", "dbms mca", "ca124"],
  },
  {
    name: "Cyber Security",
    branch: "MCA",
    keys: ["cyber security mca", "ca125"],
  },
  {
    name: "Python Programming",
    branch: "MCA",
    keys: ["python programming mca", "python mca", "ca231"],
  },
  {
    name: "Design and Analysis of Algorithm",
    branch: "MCA",
    keys: ["design and analysis of algorithm", "daa", "algorithm"],
  },
  {
    name: "AI and Machine Learning",
    branch: "MCA",
    keys: ["machine learning", "artificial intelligence", "ai ml", "aiml"],
  },
  {
    name: "Internet of Things",
    branch: "MCA",
    keys: ["internet of things mca", "iot mca", "ca234"],
  },
  {
    name: "Software Engineering",
    branch: "MCA",
    keys: ["software engineering mca", "se mca", "ca241"],
  },
  {
    name: "Advanced Java Programming",
    branch: "MCA",
    keys: ["advanced java", "java programming mca", "ca242"],
  },
  {
    name: "Cloud Computing",
    branch: "MCA",
    keys: ["cloud computing mca", "cloud mca", "ca243"],
  },

  // BSc_ITM subjects
  {
    name: "Environmental Studies",
    branch: "BSc_ITM",
    keys: ["environmental studies", "environment", "tm111"],
  },
  {
    name: "Computer Fundamental for Management",
    branch: "BSc_ITM",
    keys: [
      "computer fundamental for management",
      "computer fundamental",
      "cfm",
      "tm112",
    ],
  },
  {
    name: "Programming in C",
    branch: "BSc_ITM",
    keys: ["programming in c", "c programming", "tm113"],
  },
  {
    name: "Discrete Mathematics",
    branch: "BSc_ITM",
    keys: ["discrete mathematics", "discrete math bsc", "tm114"],
  },
  {
    name: "Universal Human Values",
    branch: "BSc_ITM",
    keys: ["universal human values bsc", "uhv bsc", "tm115"],
  },
  {
    name: "Communicative English",
    branch: "BSc_ITM",
    keys: ["communicative english bsc", "tm121"],
  },
  {
    name: "Computer Organization and Architecture",
    branch: "BSc_ITM",
    keys: ["computer organization bsc", "coa bsc", "tm122"],
  },
  {
    name: "Data Structure through C",
    branch: "BSc_ITM",
    keys: ["data structure through c", "data structure bsc", "tm123"],
  },
  {
    name: "Numerical Techniques",
    branch: "BSc_ITM",
    keys: ["numerical techniques", "numerical", "tm124"],
  },
  {
    name: "Object Oriented Programming using C++",
    branch: "BSc_ITM",
    keys: ["object oriented c++", "oop c++", "oops bsc", "tm231"],
  },
  {
    name: "Database System",
    branch: "BSc_ITM",
    keys: ["database system bsc", "dbms bsc", "tm232"],
  },
  {
    name: "Statistical Techniques",
    branch: "BSc_ITM",
    keys: ["statistical techniques", "statistics", "tm233"],
  },
  {
    name: "Principles of Management",
    branch: "BSc_ITM",
    keys: ["principles of management", "pom", "tm234"],
  },
  {
    name: "Python Programming",
    branch: "BSc_ITM",
    keys: ["python programming bsc", "python bsc", "tm235"],
  },
  {
    name: "Java Programming",
    branch: "BSc_ITM",
    keys: ["java programming bsc", "java bsc", "tm241"],
  },
  {
    name: "Operating System",
    branch: "BSc_ITM",
    keys: ["operating system bsc", "os bsc", "tm242"],
  },
  {
    name: "Computer Networking",
    branch: "BSc_ITM",
    keys: ["computer networking", "networking bsc", "tm243"],
  },
  {
    name: "Management Information System",
    branch: "BSc_ITM",
    keys: ["management information system", "mis", "tm244"],
  },
  {
    name: "Android Programming",
    branch: "BSc_ITM",
    keys: ["android programming", "android", "tm245"],
  },
  {
    name: "Web Technology",
    branch: "BSc_ITM",
    keys: ["web technology", "web tech", "tm351"],
  },
  {
    name: "Software Engineering",
    branch: "BSc_ITM",
    keys: ["software engineering bsc", "se bsc", "tm352"],
  },
  { name: "Data Mining", branch: "BSc_ITM", keys: ["data mining", "tm353"] },
  {
    name: "E-Commerce",
    branch: "BSc_ITM",
    keys: ["e-commerce", "ecommerce", "tm354"],
  },
  {
    name: "Computer Network",
    branch: "BSc_ITM",
    keys: ["computer network bsc", "cn bsc", "tm361"],
  },
  {
    name: "Cyber Security",
    branch: "BSc_ITM",
    keys: ["cyber security bsc", "cybersecurity bsc", "tm362"],
  },
  {
    name: "Internet of Things",
    branch: "BSc_ITM",
    keys: ["internet of things bsc", "iot bsc", "tm363"],
  },
  { name: "Project", branch: "BSc_ITM", keys: ["project bsc", "tm364"] },
];

function detectBranch(q) {
  const lower = q.toLowerCase();
  if (/\bmca\b/.test(lower)) return "MCA";
  if (/\bbca\b/.test(lower)) return "BCA";
  if (/\bbsc\b|\bitm\b|\bbsc.itm\b/.test(lower)) return "BSc_ITM";
  return null;
}

function detectUnit(q) {
  const m = q.match(/unit\s*([1-5])/i);
  return m ? `Unit ${m[1]}` : null;
}

function detectSubject(q, branch) {
  const lower = q.toLowerCase();
  let best = null,
    bestLen = 0;

  for (const sub of SUBJECTS) {
    // If branch detected, only match same branch subjects
    if (branch && sub.branch && sub.branch !== branch) continue;
    for (const key of sub.keys) {
      if (lower.includes(key) && key.length > bestLen) {
        best = sub;
        bestLen = key.length;
      }
    }
  }
  return best;
}

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  console.log(`\n[SEARCH] "${q}"`);

  try {
    const allFiles = await filesDB.find({});
    const active = allFiles.filter((f) => !f.is_duplicate);
    console.log(`[SEARCH] Active files: ${active.length}`);

    const branch = detectBranch(q);
    const unit = detectUnit(q);
    const subInfo = detectSubject(q, branch);

    console.log(
      `[SEARCH] Detected → branch:${branch} subject:${subInfo?.name}(${subInfo?.branch}) unit:${unit}`,
    );

    let results = [],
      explanation = "";

    if (subInfo || unit || branch) {
      results = active.filter((f) => {
        // Branch filter — strict
        const fileBranch = (f.branch || "").toLowerCase();
        if (branch && fileBranch !== branch.toLowerCase()) return false;

        // Subject filter — match by name AND branch
        if (subInfo) {
          const fileSub = (f.subject || "").toLowerCase();
          const wantSub = subInfo.name.toLowerCase();
          // Subject must match AND branches must match
          const subMatch =
            fileSub === wantSub ||
            fileSub.includes(wantSub.split(" ")[0]) ||
            wantSub.includes(fileSub.split(" ")[0]);
          const branchMatch =
            !subInfo.branch || fileBranch === subInfo.branch.toLowerCase();
          if (!subMatch || !branchMatch) return false;
        }

        // Unit filter
        if (unit && f.unit !== unit) return false;

        return true;
      });

      if (results.length > 0) {
        explanation = `Found ${results.length} note${results.length !== 1 ? "s" : ""} for "${q}"`;
      } else {
        let what = subInfo ? subInfo.name : "";
        if (unit) what = what ? `${what} — ${unit}` : unit;
        const where = branch
          ? ` in ${branch}`
          : subInfo?.branch
            ? ` in ${subInfo.branch}`
            : "";
        explanation = `No notes available for ${what}${where} yet. Ask your teacher to upload notes.`;
      }
    } else {
      // Generic word search
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
          f.summary,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return words.every((w) => hay.includes(w));
      });
      explanation =
        results.length > 0
          ? `Found ${results.length} file${results.length !== 1 ? "s" : ""} for "${q}"`
          : `No notes found for "${q}"`;
    }

    console.log(`[SEARCH] ${results.length} results | ${explanation}`);
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
