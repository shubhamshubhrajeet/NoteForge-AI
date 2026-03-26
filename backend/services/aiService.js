const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Levenshtein distance ──────────────────────────────────────────────────────
function editDist(a, b) {
  const m = a.length,
    n = b.length;
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

// Similarity 0-1 between two strings
function sim(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  const maxL = Math.max(a.length, b.length);
  if (maxL === 0) return 1;
  return 1 - editDist(a, b) / maxL;
}

// ── Word-level fuzzy match ────────────────────────────────────────────────────
// For each word in keyword, find best matching word in text
// Score = average of per-word best matches
function wordFuzzyScore(text, keyword) {
  const textWords = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const keywordWords = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  if (keywordWords.length === 0) return 0;

  // Exact substring bonus
  if (text.toLowerCase().includes(keyword.toLowerCase())) return 1.0;

  let totalScore = 0;
  for (const kw of keywordWords) {
    let best = 0;
    for (const tw of textWords) {
      const s = sim(tw, kw);
      if (s > best) best = s;
    }
    totalScore += best;
  }
  return totalScore / keywordWords.length;
}

// ── Subject master list ───────────────────────────────────────────────────────
const SUBJECTS = [
  // MCA 1st Sem
  {
    code: "CA111",
    name: "Discrete Mathematical Structure",
    branch: "MCA",
    sem: "1st Sem",
    keys: [
      "discrete mathematical structure",
      "discrete math",
      "dms",
      "discrete structure",
    ],
  },
  {
    code: "CA112",
    name: "Operating System",
    branch: "MCA",
    sem: "1st Sem",
    keys: [
      "operating system",
      "os",
      "operating sys",
      "oprating system",
      "opreating system",
      "operting system",
      "operating systems",
    ],
  },
  {
    code: "CA113",
    name: "Data Structure using C",
    branch: "MCA",
    sem: "1st Sem",
    keys: [
      "data structure",
      "dsa",
      "data structures",
      "data structure using c",
      "data str",
    ],
  },
  {
    code: "CA114",
    name: "Computer Organization and Architecture",
    branch: "MCA",
    sem: "1st Sem",
    keys: [
      "computer organization",
      "computer architecture",
      "coa",
      "computer org",
      "comp org",
    ],
  },
  {
    code: "CA115",
    name: "Universal Human Values",
    branch: "MCA",
    sem: "1st Sem",
    keys: ["universal human values", "human values", "uhv", "universal human"],
  },
  {
    code: "CA116",
    name: "Communicative English",
    branch: "MCA",
    sem: "1st Sem",
    keys: [
      "communicative english",
      "english communication",
      "comm english",
      "english",
    ],
  },
  // MCA 2nd Sem
  {
    code: "CA121",
    name: "Linear Algebra and Numerical Optimization",
    branch: "MCA",
    sem: "2nd Sem",
    keys: [
      "linear algebra",
      "numerical optimization",
      "lano",
      "linear algebra numerical",
    ],
  },
  {
    code: "CA122",
    name: "Computer Network",
    branch: "MCA",
    sem: "2nd Sem",
    keys: [
      "computer network",
      "networking",
      "cn",
      "computer networks",
      "comp network",
    ],
  },
  {
    code: "CA123",
    name: "Object Oriented Programming",
    branch: "MCA",
    sem: "2nd Sem",
    keys: [
      "object oriented programming",
      "oop",
      "oops",
      "object oriented",
      "oops programming",
    ],
  },
  {
    code: "CA124",
    name: "Database System",
    branch: "MCA",
    sem: "2nd Sem",
    keys: [
      "database system",
      "dbms",
      "database",
      "database management",
      "db system",
    ],
  },
  {
    code: "CA125",
    name: "Cyber Security",
    branch: "MCA",
    sem: "2nd Sem",
    keys: ["cyber security", "cybersecurity", "cyber sec", "security", "cyber"],
  },
  // MCA 3rd Sem
  {
    code: "CA231",
    name: "Python Programming",
    branch: "MCA",
    sem: "3rd Sem",
    keys: [
      "python programming",
      "python",
      "pyhton",
      "pythn programming",
      "pytho",
    ],
  },
  {
    code: "CA232",
    name: "Design and Analysis of Algorithm",
    branch: "MCA",
    sem: "3rd Sem",
    keys: [
      "design and analysis of algorithm",
      "daa",
      "algorithm",
      "algorithms",
      "design analysis algorithm",
      "algo",
    ],
  },
  {
    code: "CA233",
    name: "AI and Machine Learning",
    branch: "MCA",
    sem: "3rd Sem",
    keys: [
      "artificial intelligence",
      "machine learning",
      "ai ml",
      "ai and machine learning",
      "aiml",
      "ml",
    ],
  },
  {
    code: "CA234",
    name: "Internet of Things",
    branch: "MCA",
    sem: "3rd Sem",
    keys: ["internet of things", "iot", "internet things"],
  },
  // MCA 4th Sem
  {
    code: "CA241",
    name: "Software Engineering",
    branch: "MCA",
    sem: "4th Sem",
    keys: [
      "software engineering",
      "se",
      "sofware engineering",
      "softwar engineering",
      "software eng",
      "softwre engineering",
      "softare engineering",
      "software engg",
    ],
  },
  {
    code: "CA242",
    name: "Advanced Java Programming",
    branch: "MCA",
    sem: "4th Sem",
    keys: [
      "advanced java",
      "java programming",
      "advanced java programming",
      "java",
    ],
  },
  {
    code: "CA243",
    name: "Cloud Computing",
    branch: "MCA",
    sem: "4th Sem",
    keys: [
      "cloud computing",
      "cloud",
      "clod computing",
      "coud computing",
      "cloud comp",
    ],
  },
];

const UNIT_MAP = [
  {
    unit: "Unit 1",
    words: [
      "unit 1",
      "unit1",
      "unit-1",
      "unit i",
      "unit one",
      "unt 1",
      "unit i ",
      "uni 1",
      "uit 1",
    ],
  },
  {
    unit: "Unit 2",
    words: [
      "unit 2",
      "unit2",
      "unit-2",
      "unit ii",
      "unit two",
      "unt 2",
      "uni 2",
      "uit 2",
    ],
  },
  {
    unit: "Unit 3",
    words: [
      "unit 3",
      "unit3",
      "unit-3",
      "unit iii",
      "unit three",
      "unt 3",
      "uni 3",
      "uit 3",
    ],
  },
  {
    unit: "Unit 4",
    words: [
      "unit 4",
      "unit4",
      "unit-4",
      "unit iv",
      "unit four",
      "unt 4",
      "uni 4",
      "uit 4",
    ],
  },
  {
    unit: "Unit 5",
    words: [
      "unit 5",
      "unit5",
      "unit-5",
      "unit v",
      "unit five",
      "unt 5",
      "uni 5",
      "uit 5",
    ],
  },
];

const SEM_MAP = [
  {
    sem: "1st Sem",
    words: ["1st sem", "first sem", "sem 1", "semester 1", "1sem", "sem1"],
  },
  {
    sem: "2nd Sem",
    words: ["2nd sem", "second sem", "sem 2", "semester 2", "2sem", "sem2"],
  },
  {
    sem: "3rd Sem",
    words: ["3rd sem", "third sem", "sem 3", "semester 3", "3sem", "sem3"],
  },
  {
    sem: "4th Sem",
    words: ["4th sem", "fourth sem", "sem 4", "semester 4", "4sem", "sem4"],
  },
  {
    sem: "5th Sem",
    words: ["5th sem", "fifth sem", "sem 5", "semester 5", "5sem", "sem5"],
  },
  {
    sem: "6th Sem",
    words: ["6th sem", "sixth sem", "sem 6", "semester 6", "6sem", "sem6"],
  },
];

// ── Parse commit text into category ──────────────────────────────────────────
function parseText(text) {
  if (!text) return null;

  // Clean: lowercase, remove filename extensions, collapse spaces
  const clean = text
    .toLowerCase()
    .replace(/\.(pdf|docx?|txt|pptx?|png|jpg|jpeg)/g, " ")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  console.log("[PARSE] Cleaned text:", clean);

  // Branch (exact word)
  let branch = "Unknown";
  if (/\bmca\b/.test(clean)) branch = "MCA";
  else if (/\bbca\b/.test(clean)) branch = "BCA";
  else if (/\bbsc\b|\bitm\b/.test(clean)) branch = "BSc_ITM";

  // Unit (exact first, then fuzzy)
  let unit = "Unknown";
  for (const { unit: u, words } of UNIT_MAP) {
    if (words.some((w) => clean.includes(w))) {
      unit = u;
      break;
    }
  }
  // digit fallback: "unit 3" etc.
  if (unit === "Unknown") {
    const m = clean.match(/\bunit\s*([1-5])\b/i);
    if (m) unit = "Unit " + m[1];
  }

  // Semester (exact)
  let semester = "Unknown";
  for (const { sem, words } of SEM_MAP) {
    if (words.some((w) => clean.includes(w))) {
      semester = sem;
      break;
    }
  }
  // digit fallback
  if (semester === "Unknown") {
    const m = clean.match(/\b([1-6])(?:st|nd|rd|th)?\s*sem(?:ester)?\b/i);
    if (m) {
      const n = parseInt(m[1]);
      const sfx = ["", "st", "nd", "rd", "th", "th", "th"][n];
      semester = `${n}${sfx} Sem`;
    }
  }

  // Subject — word-level fuzzy scoring against all keywords
  let subject = "Unknown",
    code = "",
    inferBranch = branch,
    inferSem = semester;
  let bestScore = 0;

  for (const sub of SUBJECTS) {
    let topScore = 0;
    for (const kw of sub.keys) {
      const s = wordFuzzyScore(clean, kw);
      if (s > topScore) topScore = s;
    }
    console.log(`[PARSE] ${sub.name}: score=${topScore.toFixed(3)}`);
    if (topScore > bestScore && topScore >= 0.65) {
      bestScore = topScore;
      subject = sub.name;
      code = sub.code;
      if (branch === "Unknown") inferBranch = sub.branch;
      if (semester === "Unknown") inferSem = sub.sem;
    }
  }

  if (branch === "Unknown") branch = inferBranch;
  if (semester === "Unknown") semester = inferSem;

  console.log(
    `[PARSE] Result → branch:${branch} sem:${semester} subject:${subject} unit:${unit} score:${bestScore.toFixed(3)}`,
  );

  const stop = new Set([
    "notes",
    "note",
    "unit",
    "sem",
    "semester",
    "mca",
    "bca",
    "bsc",
    "itm",
    "the",
    "and",
    "for",
    "with",
    "this",
    "from",
  ]);
  const tags = clean
    .split(/\W+/)
    .filter((w) => w.length > 3 && !stop.has(w) && !/^\d+$/.test(w))
    .slice(0, 4);

  return {
    branch,
    semester,
    subject,
    unit,
    tags,
    summary: text.trim(),
    _code: code,
    _score: bestScore,
  };
}

// ── Main categorize ───────────────────────────────────────────────────────────
async function categorizeFile(fileName, textContent, remarks, hints) {
  hints = hints || {};

  // 1. Full manual hints — use directly, no parsing needed
  const allHints = ["branch", "semester", "subject", "unit"].every(
    (k) => hints[k] && hints[k] !== "Unknown" && hints[k] !== "",
  );
  if (allHints) {
    console.log("[AI] Manual mode — using hints directly");
    return {
      branch: hints.branch,
      semester: hints.semester,
      subject: hints.subject,
      unit: hints.unit,
      tags: [],
      summary: remarks || `${hints.subject} ${hints.unit}`,
      _source: "manual",
    };
  }

  // 2. Build combined input — commit is most important, then filename
  const combined = [remarks, hints.subject, hints.unit, fileName]
    .filter(Boolean)
    .join(" ");
  const parsed = parseText(combined);

  const complete =
    parsed &&
    parsed.branch !== "Unknown" &&
    parsed.subject !== "Unknown" &&
    parsed.unit !== "Unknown";

  if (complete) {
    console.log(
      `[AI] ✓ Parsed — ${parsed.branch} / ${parsed.semester} / ${parsed.subject} / ${parsed.unit}`,
    );
    return { ...parsed, _source: "fuzzy" };
  }

  // 3. Gemini fallback
  if (
    process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.includes("paste")
  ) {
    try {
      const prompt = `College notes file classifier. Return ONLY raw JSON, no markdown, no explanation.

Commit message: "${remarks || ""}"
Filename: "${fileName}"

Branches & subjects:
MCA 1st Sem: Discrete Mathematical Structure, Operating System, Data Structure using C, Computer Organization and Architecture, Universal Human Values, Communicative English
MCA 2nd Sem: Linear Algebra and Numerical Optimization, Computer Network, Object Oriented Programming, Database System, Cyber Security
MCA 3rd Sem: Python Programming, Design and Analysis of Algorithm, AI and Machine Learning, Internet of Things
MCA 4th Sem: Software Engineering, Advanced Java Programming, Cloud Computing

JSON: {"branch":"MCA","semester":"1st Sem","subject":"Operating System","unit":"Unit 3","tags":["os"],"summary":"brief desc"}`;

      const raw = (await model.generateContent(prompt)).response.text().trim();
      const clean2 = raw
        .replace(/^```json[\s\S]*?```|^```[\s\S]*?```/gm, "")
        .replace(/```/g, "")
        .trim();
      const result = JSON.parse(clean2);
      if (result.semester && !/Sem$/i.test(result.semester))
        result.semester =
          result.semester.trim().replace(/semester\s*/i, "") + " Sem";
      console.log(
        "[AI] Gemini result:",
        result.branch,
        result.semester,
        result.subject,
        result.unit,
      );
      return { ...result, _source: "gemini" };
    } catch (e) {
      console.warn("[AI] Gemini failed:", e.message);
    }
  }

  // 4. Return whatever partial result we have
  console.log("[AI] Partial result:", parsed?.subject, parsed?.unit);
  return (
    parsed || {
      branch: "Unknown",
      semester: "Unknown",
      subject: "Unknown",
      unit: "Unknown",
      tags: [],
      summary: fileName,
    }
  );
}

// ── Smart search ──────────────────────────────────────────────────────────────
async function smartSearch(query, allFiles) {
  const summary = allFiles
    .slice(0, 60)
    .map(
      (f) =>
        `ID:${f._id}|${f.branch || "?"}${f.semester || "?"}|${f.subject || "?"}|${f.unit || "?"}|${f.original_name}`,
    )
    .join("\n");
  try {
    const raw = (
      await model.generateContent(
        `Search college notes.\nQuery: "${query}"\nFiles:\n${summary}\nReturn ONLY JSON: {"matched_ids":["id1"],"explanation":"one sentence"}`,
      )
    ).response
      .text()
      .trim();
    return JSON.parse(raw.replace(/^```json|```$/gm, "").trim());
  } catch {
    const q = query.toLowerCase();
    return {
      matched_ids: allFiles
        .filter((f) =>
          [
            f.original_name,
            f.subject,
            f.branch,
            f.unit,
            f.semester,
            f.remarks,
          ].some((v) => v && v.toLowerCase().includes(q)),
        )
        .map((f) => f._id),
      explanation: "Keyword fallback search",
    };
  }
}

// ── Duplicate check ───────────────────────────────────────────────────────────
async function checkSemanticDuplicate(f1, f2) {
  try {
    const raw = (
      await model.generateContent(
        `Duplicates?\nF1:${f1.original_name}|${f1.branch}${f1.semester}|${f1.subject}|${f1.unit}\nF2:${f2.original_name}|${f2.branch}${f2.semester}|${f2.subject}|${f2.unit}\nReturn ONLY JSON:{"is_duplicate":true,"confidence":"high","reason":"one sentence"}`,
      )
    ).response
      .text()
      .trim();
    return JSON.parse(raw.replace(/^```json|```$/gm, "").trim());
  } catch {
    return {
      is_duplicate: false,
      confidence: "low",
      reason: "Could not determine",
    };
  }
}

module.exports = { categorizeFile, smartSearch, checkSemanticDuplicate };
