import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Sparkles,
  SlidersHorizontal,
  Upload as UploadIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  MessageSquare,
  ChevronRight,
  FolderOpen,
  BookOpen,
  Hash,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { filesAPI } from "../api/client";
import { getCoursesByBranchSem, ALL_COURSES } from "../data/courseStructure";

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];

// ─── Shared dropzone component ────────────────────────────────────────────────
function DropZone({ onDrop, disabled, label, uploading, progress }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
        ${
          disabled
            ? "border-gray-800 opacity-40 cursor-not-allowed"
            : isDragActive
              ? "border-indigo-500 bg-indigo-950/30 cursor-copy"
              : "border-gray-700 hover:border-indigo-500 hover:bg-gray-900/60 cursor-pointer"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploading ? (
          <Loader2 size={36} className="text-indigo-400 animate-spin" />
        ) : (
          <UploadIcon
            size={36}
            className={
              isDragActive
                ? "text-indigo-400"
                : disabled
                  ? "text-gray-700"
                  : "text-gray-500"
            }
          />
        )}
        <div>
          <p className="text-sm font-semibold text-white">
            {uploading
              ? `Uploading… ${progress}%`
              : disabled
                ? "Complete the fields above first"
                : isDragActive
                  ? "Drop files here!"
                  : label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, DOCX, TXT, Images · Multiple files allowed
          </p>
        </div>
        {uploading && (
          <div className="w-48 bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result list ──────────────────────────────────────────────────────────────
function ResultList({ results }) {
  if (!results.length) return null;
  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm font-semibold text-white">Upload Results</p>
      {results.map((r, i) => (
        <div
          key={i}
          className={`bg-gray-900 border rounded-xl p-3.5
          ${r.status === "duplicate" ? "border-yellow-800" : r.status === "uploaded" ? "border-green-900" : "border-gray-800"}`}
        >
          <div className="flex items-start gap-3">
            {r.status === "uploaded" ? (
              <CheckCircle
                size={15}
                className="text-green-400 shrink-0 mt-0.5"
              />
            ) : r.status === "duplicate" ? (
              <AlertCircle
                size={15}
                className="text-yellow-400 shrink-0 mt-0.5"
              />
            ) : (
              <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {r.original_name}
              </p>
              {r.status === "uploaded" && r.category && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    r.category.branch,
                    r.category.semester,
                    r.category.subject,
                    r.category.unit,
                  ]
                    .filter(Boolean)
                    .filter((v) => v !== "Unknown")
                    .map((tag, ti) => (
                      <span
                        key={ti}
                        className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
              {r.status === "duplicate" && (
                <p className="text-xs text-yellow-500 mt-1">
                  Already exists: {r.duplicate_of_name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI MODE
// ═══════════════════════════════════════════════════════════════════════════════
function AiMode() {
  const [commit, setCommit] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (files) => {
      if (!commit.trim())
        return toast.error(
          "Write a commit message first so AI knows where to put the file",
        );
      setUploading(true);
      setResults([]);
      setProgress(0);

      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("remarks", commit.trim());

      try {
        const res = await filesAPI.upload(fd, setProgress);
        setResults(res.data.results);
        const up = res.data.results.filter(
          (r) => r.status === "uploaded",
        ).length;
        const dup = res.data.results.filter(
          (r) => r.status === "duplicate",
        ).length;
        toast.success(
          `${up} file${up !== 1 ? "s" : ""} uploaded${dup ? `, ${dup} skipped` : ""}`,
        );
        setCommit("");
      } catch (err) {
        toast.error(
          "Upload failed: " + (err.response?.data?.error || err.message),
        );
      }
      setUploading(false);
    },
    [commit],
  );

  const examples = [
    "MCA Software Engineering Unit 2",
    "MCA 4th Sem Cloud Computing Unit 1 notes",
    "BCA 3rd Sem DBMS Unit 3",
    "MCA Operating System Unit 4 process scheduling",
  ];

  return (
    <div className="space-y-4">
      {/* Commit input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <MessageSquare size={15} className="text-indigo-400" />
          Describe where this file belongs
        </label>

        <textarea
          value={commit}
          onChange={(e) => setCommit(e.target.value)}
          rows={2}
          placeholder='e.g.  "MCA Software Engineering Unit 2"'
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 resize-none transition-colors"
        />

        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <Info size={11} /> Quick examples — click to use:
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setCommit(ex)}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-600 text-gray-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 bg-indigo-950/40 border border-indigo-900/50 rounded-lg px-3 py-2.5 flex items-start gap-2">
          <Sparkles size={13} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-300 leading-relaxed">
            AI reads your message and automatically places the file in the
            correct{" "}
            <strong className="text-indigo-200">
              Branch → Semester → Subject → Unit
            </strong>{" "}
            folder. The more specific you write, the more accurate the
            placement.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <DropZone
        onDrop={onDrop}
        disabled={!commit.trim() || uploading}
        uploading={uploading}
        progress={progress}
        label="Drag & drop files here or click to browse"
      />

      <ResultList results={results} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANUAL MODE
// ═══════════════════════════════════════════════════════════════════════════════
function ManualMode() {
  const [selBranch, setSelBranch] = useState("MCA");
  const [selSem, setSelSem] = useState("1st Sem");
  const [selCode, setSelCode] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [selUnit, setSelUnit] = useState("");
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const branchData = ALL_COURSES.find((c) => c.branch === selBranch);
  const semList = branchData?.semesters.map((s) => s.sem) || [];
  const subjects = getCoursesByBranchSem(selBranch, selSem);
  const isReady = selBranch && selSem && selSubject && selUnit;

  function handleBranch(b) {
    setSelBranch(b);
    const bd = ALL_COURSES.find((c) => c.branch === b);
    setSelSem(bd?.semesters[0]?.sem || "1st Sem");
    setSelCode("");
    setSelSubject("");
    setSelUnit("");
  }

  function handleSubject(code) {
    const sub = subjects.find((s) => s.code === code);
    setSelCode(code);
    setSelSubject(sub?.name || "");
    setSelUnit("");
  }

  const onDrop = useCallback(
    async (files) => {
      if (!isReady) return;
      setUploading(true);
      setResults([]);
      setProgress(0);

      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("remarks", remarks.trim());
      fd.append("hint_branch", selBranch);
      fd.append("hint_semester", selSem);
      fd.append("hint_subject", selSubject);
      fd.append("hint_unit", selUnit);
      fd.append("course_code", selCode);

      try {
        const res = await filesAPI.upload(fd, setProgress);
        setResults(res.data.results);
        const up = res.data.results.filter(
          (r) => r.status === "uploaded",
        ).length;
        const dup = res.data.results.filter(
          (r) => r.status === "duplicate",
        ).length;
        toast.success(
          `${up} file${up !== 1 ? "s" : ""} uploaded${dup ? `, ${dup} skipped` : ""}`,
        );
        setRemarks("");
      } catch (err) {
        toast.error(
          "Upload failed: " + (err.response?.data?.error || err.message),
        );
      }
      setUploading(false);
    },
    [isReady, remarks, selBranch, selSem, selSubject, selUnit, selCode],
  );

  // Path breadcrumb
  const path = [
    selBranch,
    selSem,
    selSubject || "— subject —",
    selUnit || "— unit —",
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
        {/* Branch */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FolderOpen size={11} /> Branch
          </p>
          <div className="flex gap-2 flex-wrap">
            {ALL_COURSES.map((c) => (
              <button
                key={c.branch}
                onClick={() => handleBranch(c.branch)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                  ${
                    selBranch === c.branch
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
              >
                {c.branch}
              </button>
            ))}
          </div>
        </div>

        {/* Semester */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Semester
          </p>
          <div className="flex gap-2 flex-wrap">
            {semList.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelSem(s);
                  setSelCode("");
                  setSelSubject("");
                  setSelUnit("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${
                    selSem === s
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <BookOpen size={11} /> Subject
          </p>
          {subjects.length === 0 ? (
            <p className="text-xs text-gray-600 italic">
              No subjects defined for {selBranch} {selSem} yet
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <button
                  key={sub.code}
                  onClick={() => handleSubject(sub.code)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                      ${
                        selCode === sub.code
                          ? "bg-indigo-900/50 border-indigo-600 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                >
                  <span className="text-xs font-mono text-gray-500 w-14 shrink-0">
                    {sub.code}
                  </span>
                  <span className="text-sm flex-1">{sub.name}</span>
                  {selCode === sub.code && (
                    <ChevronRight
                      size={14}
                      className="text-indigo-400 shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Unit */}
        {selSubject && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Hash size={11} /> Unit
            </p>
            <div className="flex gap-2 flex-wrap">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelUnit(u)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all
                    ${
                      selUnit === u
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional remark */}
        {isReady && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Remark (optional)
            </p>
            <input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={`e.g. "Unit notes by Prof. Sharma covering ${selSubject}"`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {/* Path breadcrumb */}
        {isReady && (
          <div className="flex items-center gap-1 flex-wrap bg-gray-800 rounded-lg px-3 py-2">
            <FolderOpen size={12} className="text-indigo-400 shrink-0" />
            {path.map((p, i) => (
              <React.Fragment key={i}>
                <span
                  className={`text-xs ${i === path.length - 1 ? "text-white font-medium" : "text-gray-400"}`}
                >
                  {p}
                </span>
                {i < path.length - 1 && (
                  <ChevronRight size={10} className="text-gray-600" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Drop zone */}
      <DropZone
        onDrop={onDrop}
        disabled={!isReady || uploading}
        uploading={uploading}
        progress={progress}
        label={
          isReady
            ? `Drop files into ${selSubject} → ${selUnit}`
            : "Complete the selections above first"
        }
      />

      <ResultList results={results} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN UPLOAD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Upload() {
  const [mode, setMode] = useState("ai"); // "ai" | "manual"

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Upload Notes</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Choose how you want to upload — AI auto-places or manual folder
          selection
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${
              mode === "ai"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-gray-400 hover:text-white"
            }`}
        >
          <Sparkles size={16} />
          AI Auto-Place
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${
              mode === "manual"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white"
            }`}
        >
          <SlidersHorizontal size={16} />
          Manual Select
        </button>
      </div>

      {/* Mode description pill */}
      <div
        className={`rounded-xl px-4 py-3 mb-5 text-xs flex items-start gap-2
        ${
          mode === "ai"
            ? "bg-indigo-950/50 border border-indigo-900/60 text-indigo-300"
            : "bg-gray-900 border border-gray-800 text-gray-400"
        }`}
      >
        {mode === "ai" ? (
          <>
            <Sparkles size={13} className="shrink-0 mt-0.5 text-indigo-400" />
            <span>
              Write what the note is about — AI reads it and places the file in
              the right folder automatically. No clicking needed.
            </span>
          </>
        ) : (
          <>
            <SlidersHorizontal size={13} className="shrink-0 mt-0.5" />
            <span>
              Pick Branch → Semester → Subject → Unit manually, then drop your
              files. Full control over placement.
            </span>
          </>
        )}
      </div>

      {/* Render active mode */}
      {mode === "ai" ? <AiMode /> : <ManualMode />}
    </div>
  );
}
