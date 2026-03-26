import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Folder,
  BookOpen,
  Hash,
  Wand2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { filesAPI, aiAPI } from "../api/client";
import { getCoursesByBranchSem, ALL_COURSES } from "../data/courseStructure";
import FileCard from "../components/FileCard";

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];
const BRANCH_COLORS = {
  MCA: "bg-indigo-600",
  BCA: "bg-blue-600",
  BSc_ITM: "bg-teal-600",
};

export default function Browse() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [page, setPage] = useState(1);
  const [branch, setBranch] = useState("");
  const [sem, setSem] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");

  const branchData = ALL_COURSES.find((c) => c.branch === branch);
  const semList = branchData?.semesters.map((s) => s.sem) || [];
  const subjects = getCoursesByBranchSem(branch, sem);
  const unknownCount = files.filter(
    (f) => f.branch === "Unknown" || f.subject === "Unknown",
  ).length;

  async function load(b, s, sub, u, p) {
    setLoading(true);
    try {
      const params = { page: p || 1, limit: 15 };
      if (b) params.branch = b;
      if (s) params.semester = s;
      if (sub) params.subject = sub;
      if (u) params.unit = u;
      const res = await filesAPI.list(params);
      setFiles(res.data.files);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(branch, sem, subject, unit, page);
  }, [branch, sem, subject, unit, page]);

  async function handleFixAll() {
    setFixing(true);
    try {
      const res = await aiAPI.fixAllUnknown();
      const { fixed, total: tot } = res.data;
      if (fixed > 0) {
        toast.success(`Fixed ${fixed} of ${tot} unknown files!`);
        load(branch, sem, subject, unit, page);
      } else {
        toast("No files could be fixed — they may have no remarks stored.", {
          icon: "ℹ️",
        });
      }
    } catch (e) {
      toast.error("Fix failed: " + (e.response?.data?.error || e.message));
    }
    setFixing(false);
  }

  function clearAll() {
    setBranch("");
    setSem("");
    setSubject("");
    setUnit("");
    setPage(1);
  }
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Browse Notes</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {total} files in library
          </p>
        </div>
        {unknownCount > 0 && (
          <button
            onClick={handleFixAll}
            disabled={fixing}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {fixing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Wand2 size={14} />
            )}
            {fixing
              ? "Fixing…"
              : `Fix ${unknownCount} Unknown File${unknownCount > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Unknown warning banner */}
      {unknownCount > 0 && !loading && (
        <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">
            <strong className="font-semibold">
              {unknownCount} file{unknownCount > 1 ? "s" : ""} not categorized.
            </strong>{" "}
            Click <strong>"Fix Unknown Files"</strong> above to auto-fix them
            using stored remarks. Or hover a card and click the ↺ refresh icon
            to fix individually.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Folder size={11} /> Branch
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={clearAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!branch ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
            >
              All
            </button>
            {ALL_COURSES.map((c) => (
              <button
                key={c.branch}
                onClick={() => {
                  setBranch(c.branch);
                  setSem("");
                  setSubject("");
                  setUnit("");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  branch === c.branch
                    ? `${BRANCH_COLORS[c.branch]} border-transparent text-white`
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {c.branch}
              </button>
            ))}
          </div>
        </div>

        {branch && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Semester
            </p>
            <div className="flex gap-2 flex-wrap">
              {semList.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSem(s);
                    setSubject("");
                    setUnit("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    sem === s
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {sem && subjects.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen size={11} /> Subject
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSubject("");
                  setUnit("");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!subject ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
              >
                All
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.code}
                  onClick={() => {
                    setSubject(sub.name);
                    setUnit("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    subject === sub.name
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="opacity-50 mr-1">{sub.code}</span>
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {subject && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Hash size={11} /> Unit
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setUnit("");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!unit ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
              >
                All
              </button>
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setUnit(u);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    unit === u
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl h-48 animate-pulse"
              />
            ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Folder size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No files found</p>
          <p className="text-sm text-gray-600 mt-1">Try different filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => (
              <FileCard
                key={f._id || f.id}
                file={{ ...f, id: f._id || f.id }}
                onDelete={(id) => {
                  setFiles((fs) => fs.filter((x) => (x._id || x.id) !== id));
                  setTotal((t) => t - 1);
                }}
                onRecategorize={(id, cat) =>
                  setFiles((fs) =>
                    fs.map((x) =>
                      (x._id || x.id) === id ? { ...x, ...cat } : x,
                    ),
                  )
                }
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-indigo-600 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
