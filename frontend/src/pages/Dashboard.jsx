import React, { useEffect, useState } from "react";
import {
  Upload,
  Search,
  Copy,
  HardDrive,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Hash,
} from "lucide-react";
import { statsAPI, filesAPI } from "../api/client";
import { ALL_COURSES } from "../data/courseStructure";

const BRANCH_STYLE = {
  MCA: {
    border: "border-indigo-800/50",
    bg: "bg-indigo-950/30",
    icon: "bg-indigo-700",
    badge: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
    semBtn: "hover:bg-indigo-900/40 border-indigo-900/50",
  },
  BCA: {
    border: "border-blue-800/50",
    bg: "bg-blue-950/30",
    icon: "bg-blue-700",
    badge: "bg-blue-900/60 text-blue-300 border-blue-700",
    semBtn: "hover:bg-blue-900/40 border-blue-900/50",
  },
  BSc_ITM: {
    border: "border-teal-800/50",
    bg: "bg-teal-950/30",
    icon: "bg-teal-700",
    badge: "bg-teal-900/60 text-teal-300 border-teal-700",
    semBtn: "hover:bg-teal-900/40 border-teal-900/50",
  },
};

function UnitBar({ count, unit }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-gray-600 w-12 shrink-0">{unit}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all ${count > 0 ? "bg-indigo-500" : "bg-gray-700"}`}
          style={{ width: count > 0 ? "100%" : "0%" }}
        />
      </div>
      <span
        className={`text-xs w-6 text-right ${count > 0 ? "text-indigo-300" : "text-gray-700"}`}
      >
        {count}
      </span>
    </div>
  );
}

function SubjectRow({ sub, fileCounts }) {
  const [open, setOpen] = useState(false);
  const subCount = fileCounts[sub.code] || {};
  const total = Object.values(subCount).reduce((a, b) => a + b, 0);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden mb-1.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
      >
        <BookOpen size={13} className="text-gray-500 shrink-0" />
        <span className="text-xs font-mono text-gray-600 w-14 shrink-0">
          {sub.code}
        </span>
        <span className="text-sm text-gray-200 flex-1">{sub.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${total > 0 ? "bg-indigo-900/60 text-indigo-300" : "bg-gray-800 text-gray-600"}`}
        >
          {total} files
        </span>
        {open ? (
          <ChevronDown size={13} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-gray-500 shrink-0" />
        )}
      </button>

      {open && (
        <div className="bg-gray-950 px-4 py-3 border-t border-gray-800">
          {sub.units.map((u) => (
            <UnitBar key={u} unit={u} count={subCount[u] || 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function SemesterPanel({ semData, style, fileCounts }) {
  const [open, setOpen] = useState(false);
  const total = semData.subjects.reduce((sum, sub) => {
    const sc = fileCounts[sub.code] || {};
    return sum + Object.values(sc).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <div
      className={`border ${style.semBtn.replace("hover:bg", "border").replace("/40", "").replace("border-", "border-")} rounded-xl mb-2 overflow-hidden`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${style.bg} hover:brightness-110 transition-all text-left`}
      >
        <Folder size={15} className="text-gray-400 shrink-0" />
        <span className="text-sm font-semibold text-white flex-1">
          {semData.sem}
        </span>
        <span className="text-xs text-gray-500">
          {semData.subjects.length} subjects
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-2 ${style.badge}`}
        >
          {total} files
        </span>
        {open ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronRight size={14} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-3 py-3 bg-gray-950 border-t border-gray-800">
          {semData.subjects.length === 0 ? (
            <p className="text-xs text-gray-600 italic text-center py-3">
              No subjects defined yet for this branch/semester
            </p>
          ) : (
            semData.subjects.map((sub) => (
              <SubjectRow key={sub.code} sub={sub} fileCounts={fileCounts} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BranchCard({ course, fileCounts, onNavigate }) {
  const style = BRANCH_STYLE[course.branch] || BRANCH_STYLE.MCA;
  const total = Object.values(fileCounts).reduce(
    (sum, sc) => sum + Object.values(sc).reduce((a, b) => a + b, 0),
    0,
  );

  return (
    <div className={`rounded-xl border ${style.border} overflow-hidden`}>
      <div
        className={`flex items-center justify-between px-4 py-3 ${style.bg} border-b border-white/5`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 ${style.icon} rounded-lg flex items-center justify-center`}
          >
            <Folder size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{course.branch}</p>
            <p className="text-xs text-gray-500">{course.fullName}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full border font-medium ${style.badge}`}
        >
          {total} files
        </span>
      </div>
      <div className="p-3 bg-gray-900">
        {course.semesters.map((sem) => (
          <SemesterPanel
            key={sem.sem}
            semData={sem}
            style={style}
            fileCounts={fileCounts}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [fileCounts, setFileCounts] = useState({}); // { courseCode: { unitName: count } }

  useEffect(() => {
    statsAPI
      .get()
      .then((r) => setStats(r.data))
      .catch(console.error);
    filesAPI
      .list({ limit: 1000 })
      .then((r) => {
        const counts = {};
        for (const f of r.data.files || []) {
          const code = f.course_code || "";
          const unit = f.unit || "Unknown";
          // Try to match by subject name if no code
          const subjectKey = code || f.subject || "";
          if (!subjectKey) continue;
          if (!counts[subjectKey]) counts[subjectKey] = {};
          counts[subjectKey][unit] = (counts[subjectKey][unit] || 0) + 1;
        }
        setFileCounts(counts);
      })
      .catch(console.error);
  }, []);

  const totalMB = stats ? (stats.totalSize / (1024 * 1024)).toFixed(1) : "0";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          School of Professional Studies — Notes Repository
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Files",
            value: stats?.totalFiles || 0,
            icon: FileText,
            color: "bg-indigo-600",
          },
          {
            label: "Storage Used",
            value: totalMB + " MB",
            icon: HardDrive,
            color: "bg-blue-600",
          },
          {
            label: "Smart Search",
            value: "AI Ready",
            icon: Search,
            color: "bg-green-600",
            action: () => onNavigate("search"),
          },
          {
            label: "Find Duplicates",
            value: "Scan",
            icon: Copy,
            color: "bg-orange-600",
            action: () => onNavigate("duplicates"),
          },
        ].map((c) => (
          <div
            key={c.label}
            onClick={c.action}
            className={`bg-gray-900 border border-gray-800 rounded-xl p-4 ${c.action ? "cursor-pointer hover:border-gray-700" : ""} transition-all`}
          >
            <div
              className={`w-8 h-8 ${c.color} rounded-lg flex items-center justify-center mb-2`}
            >
              <c.icon size={15} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Branch folder trees */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Course Folders
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {ALL_COURSES.map((course) => (
            <BranchCard
              key={course.branch}
              course={course}
              fileCounts={Object.fromEntries(
                course.semesters.flatMap((s) =>
                  s.subjects.map((sub) => [
                    sub.code,
                    fileCounts[sub.code] || fileCounts[sub.name] || {},
                  ]),
                ),
              )}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-white mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate("upload")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={14} /> Upload Notes
          </button>
          <button
            onClick={() => onNavigate("search")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Search size={14} /> Smart Search
          </button>
          <button
            onClick={() => onNavigate("duplicates")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Copy size={14} /> Find Duplicates
          </button>
        </div>
      </div>
    </div>
  );
}
