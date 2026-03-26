import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  Search,
  Video,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Download,
  Eye,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Filter,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { filesAPI, searchAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getCoursesByBranchSem, ALL_COURSES } from "../data/courseStructure";
import StudentVideoLecture from "./StudentVideoLecture";

// ── helpers ───────────────────────────────────────────────────────────────────
const BRANCH_STYLE = {
  MCA: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
  BCA: "bg-blue-900/50 text-blue-300 border-blue-700",
  BSc_ITM: "bg-teal-900/50 text-teal-300 border-teal-700",
};
const BRANCH_ICON = {
  MCA: "bg-indigo-700",
  BCA: "bg-blue-700",
  BSc_ITM: "bg-teal-700",
};

function fileUrl(f) {
  return `/api/download/${f._id || f.id}`;
}
function canPreview(f) {
  const m = (f.mime_type || "").toLowerCase();
  const e = (f.original_name || "").split(".").pop().toLowerCase();
  return (
    m.includes("pdf") ||
    e === "pdf" ||
    m.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif"].includes(e)
  );
}
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000),
    h = Math.floor(m / 60),
    day = Math.floor(h / 24);
  if (day > 0) return `${day}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "news", icon: Newspaper, label: "What's New" },
  { id: "allnotes", icon: FolderOpen, label: "All Notes" },
  { id: "videos", icon: Video, label: "Video Lecture" },
  { id: "search", icon: Search, label: "Smart Search" },
];

function Sidebar({ page, setPage, user, logout, open, setOpen }) {
  function go(id) {
    setPage(id);
    setOpen(false);
  }
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex lg:shrink-0
      `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">
                School of Professional Studies
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Student Portal</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile */}
        <div className="mx-3 mt-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
              <User size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.rollNo || "Student"}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRANCH_STYLE[user?.branch] || "bg-gray-700 text-gray-300 border-gray-600"}`}
            >
              {user?.branch}
            </span>
            <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">
              {user?.semester}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${page === id ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────────
function TopBar({ page, setOpen, user }) {
  const current = NAV.find((n) => n.id === page);
  return (
    <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-white p-1"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {current && (
          <current.icon size={16} className="text-teal-400 shrink-0" />
        )}
        <p className="text-sm font-semibold text-white truncate">
          {current?.label}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRANCH_STYLE[user?.branch] || ""}`}
        >
          {user?.branch}
        </span>
        <span className="text-xs bg-gray-800 text-gray-300 rounded-full px-2 py-0.5">
          {user?.semester}
        </span>
      </div>
    </div>
  );
}

// ── File card (mobile-friendly) ───────────────────────────────────────────────
function FileCard({ file }) {
  const sem = file.semester || file.year || "—";
  const url = fileUrl(file);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
      <div className="flex items-start gap-2 mb-3">
        <FileText size={15} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-white leading-tight">
          {file.original_name}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRANCH_STYLE[file.branch] || "bg-gray-800 text-gray-400 border-gray-700"}`}
        >
          {file.branch || "?"}
        </span>
        <span className="text-xs bg-gray-800 text-gray-300 rounded-full px-2 py-0.5">
          {sem}
        </span>
      </div>
      {file.subject && file.subject !== "Unknown" && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          <BookOpen size={11} className="text-gray-600 shrink-0" />
          <span className="font-medium">{file.subject}</span>
          {file.unit && file.unit !== "Unknown" && (
            <span className="text-gray-600">· {file.unit}</span>
          )}
        </div>
      )}
      {file.summary && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {file.summary}
        </p>
      )}
      <div className="flex gap-2 pt-3 border-t border-gray-800">
        {canPreview(file) && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs py-2 rounded-lg transition-all font-medium"
          >
            <Eye size={12} /> View
          </a>
        )}
        <a
          href={url}
          download={file.original_name}
          className={`flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-lg transition-colors font-medium ${canPreview(file) ? "flex-1" : "w-full"}`}
        >
          <Download size={12} /> Download
        </a>
      </div>
    </div>
  );
}

// ── Unit row ──────────────────────────────────────────────────────────────────
function UnitRow({ unit, files }) {
  if (files.length === 0)
    return (
      <div className="flex items-center py-2 px-3 rounded-lg bg-gray-800/30">
        <span className="text-xs text-gray-600">
          {unit} — no notes uploaded yet
        </span>
      </div>
    );
  return (
    <div className="space-y-1.5">
      {files.map((f) => (
        <div
          key={f._id || f.id}
          className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors"
        >
          <FileText size={13} className="text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-200 truncate">
              {f.original_name}
            </p>
            <p className="text-xs text-gray-600">
              {(f.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {canPreview(f) && (
              <a
                href={fileUrl(f)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Eye size={11} /> <span className="hidden sm:inline">View</span>
              </a>
            )}
            <a
              href={fileUrl(f)}
              download={f.original_name}
              className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Download size={11} />{" "}
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Subject accordion ─────────────────────────────────────────────────────────
function SubjectAccordion({ subject, allFiles }) {
  const [open, setOpen] = useState(false);
  const units = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];
  const subFiles = allFiles.filter(
    (f) =>
      f.subject &&
      f.subject.toLowerCase().includes(subject.name.toLowerCase().slice(0, 10)),
  );
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
      >
        <BookOpen size={14} className="text-teal-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{subject.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {subject.code} · {subFiles.length} file
            {subFiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {subFiles.length > 0 && (
          <span className="text-xs bg-teal-900/60 text-teal-300 border border-teal-800 rounded-full px-2 py-0.5 font-medium shrink-0">
            {subFiles.length}
          </span>
        )}
        {open ? (
          <ChevronDown size={15} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronRight size={15} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="bg-gray-950 border-t border-gray-800 p-3 space-y-3">
          {units.map((u) => (
            <div key={u}>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">
                {u}
              </p>
              <UnitRow unit={u} files={subFiles.filter((f) => f.unit === u)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ user }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const subjects = getCoursesByBranchSem(user.branch, user.semester);

  useEffect(() => {
    filesAPI
      .list({ branch: user.branch, semester: user.semester, limit: 500 })
      .then((r) => setFiles(r.data.files || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Your notes for {user.branch} — {user.semester}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {[
          { label: "Branch", value: user.branch, color: "bg-indigo-600" },
          { label: "Semester", value: user.semester, color: "bg-teal-600" },
          {
            label: "Subjects",
            value: subjects.length || "—",
            color: "bg-purple-600",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4"
          >
            <div
              className={`w-7 h-7 ${c.color} rounded-lg flex items-center justify-center mb-2`}
            >
              <BookOpen size={13} className="text-white" />
            </div>
            <p className="text-base sm:text-lg font-bold text-white truncate">
              {c.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Subjects & Notes
        </h2>
        <span className="text-xs text-gray-500">{files.length} files</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-400" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No subjects defined yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((sub) => (
            <SubjectAccordion key={sub.code} subject={sub} allFiles={files} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── NEWS PAGE ─────────────────────────────────────────────────────────────────
function NewsPage({ user }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesAPI
      .list({ limit: 30 })
      .then((r) => setRecent(r.data.files || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isMine = (f) =>
    f.branch === user.branch &&
    (f.semester === user.semester || f.year === user.semester);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">What's New</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Recent notes uploaded by teachers
        </p>
      </div>

      {recent.filter(isMine).length > 0 && (
        <div className="bg-teal-950/40 border border-teal-800/50 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <GraduationCap size={13} /> New for your semester
          </p>
          <div className="space-y-2">
            {recent
              .filter(isMine)
              .slice(0, 5)
              .map((f) => (
                <div
                  key={f._id || f.id}
                  className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-3 py-2.5"
                >
                  <FileText size={13} className="text-teal-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {f.original_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {f.subject} · {f.unit} · {timeAgo(f.uploaded_at)}
                    </p>
                  </div>
                  <a
                    href={fileUrl(f)}
                    download={f.original_name}
                    className="shrink-0 flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Download size={11} /> Get
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        All Recent Uploads
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-teal-400" />
        </div>
      ) : recent.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          <Clock size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No notes uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((f) => (
            <div
              key={f._id || f.id}
              className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border ${isMine(f) ? "bg-teal-950/20 border-teal-900/50" : "bg-gray-900 border-gray-800"}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMine(f) ? "bg-teal-700" : "bg-gray-700"}`}
              >
                <FileText size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {f.original_name}
                  </p>
                  <span className="text-xs text-gray-600 shrink-0">
                    {timeAgo(f.uploaded_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRANCH_STYLE[f.branch] || "bg-gray-800 text-gray-400 border-gray-700"}`}
                  >
                    {f.branch}
                  </span>
                  <span className="text-xs text-gray-500">
                    {f.semester || f.year}
                  </span>
                  {f.subject && f.subject !== "Unknown" && (
                    <span className="text-xs text-gray-400 font-medium">
                      · {f.subject}
                    </span>
                  )}
                  {f.unit && f.unit !== "Unknown" && (
                    <span className="text-xs text-gray-600">· {f.unit}</span>
                  )}
                  {isMine(f) && (
                    <span className="text-xs bg-teal-900/50 text-teal-300 rounded-full px-2 py-0.5 border border-teal-800">
                      Your semester
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {canPreview(f) && (
                  <a
                    href={fileUrl(f)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye size={13} />
                  </a>
                )}
                <a
                  href={fileUrl(f)}
                  download={f.original_name}
                  className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  <Download size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ALL NOTES PAGE ────────────────────────────────────────────────────────────
function AllNotesPage() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selBranch, setSelBranch] = useState("");
  const [selSem, setSelSem] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [expandedSub, setExpandedSub] = useState(null);

  useEffect(() => {
    filesAPI
      .list({ limit: 1000 })
      .then((r) => setAllFiles(r.data.files || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const semList = selBranch
    ? ALL_COURSES.find((c) => c.branch === selBranch)?.semesters.map(
        (s) => s.sem,
      ) || []
    : [];
  const subjectList =
    selBranch && selSem
      ? ALL_COURSES.find((c) => c.branch === selBranch)?.semesters.find(
          (s) => s.sem === selSem,
        )?.subjects || []
      : [];

  const filtered = allFiles.filter((f) => {
    if (selBranch && f.branch !== selBranch) return false;
    if (selSem && (f.semester || f.year) !== selSem) return false;
    if (
      selSubject &&
      !(f.subject || "")
        .toLowerCase()
        .includes(selSubject.toLowerCase().slice(0, 10))
    )
      return false;
    return true;
  });

  const grouped = {};
  for (const f of filtered) {
    const b = f.branch || "Unknown",
      s = f.semester || f.year || "Unknown",
      sub = f.subject || "Unknown",
      u = f.unit || "Unknown";
    if (!grouped[b]) grouped[b] = {};
    if (!grouped[b][s]) grouped[b][s] = {};
    if (!grouped[b][s][sub]) grouped[b][s][sub] = {};
    if (!grouped[b][s][sub][u]) grouped[b][s][sub][u] = [];
    grouped[b][s][sub][u].push(f);
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">All Notes</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Browse notes from every branch and semester
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 space-y-3">
        {/* Branch */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Filter size={10} /> Branch
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelBranch("");
                setSelSem("");
                setSelSubject("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!selBranch ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
            >
              All
            </button>
            {ALL_COURSES.map((c) => (
              <button
                key={c.branch}
                onClick={() => {
                  setSelBranch(c.branch);
                  setSelSem("");
                  setSelSubject("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selBranch === c.branch
                    ? `${BRANCH_ICON[c.branch] || "bg-gray-700"} border-transparent text-white`
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {c.branch}
              </button>
            ))}
          </div>
        </div>

        {/* Semester */}
        {selBranch && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Semester
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelSem("");
                  setSelSubject("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!selSem ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
              >
                All
              </button>
              {semList.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelSem(s);
                    setSelSubject("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selSem === s ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject */}
        {selSem && subjectList.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen size={10} /> Subject
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelSubject("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!selSubject ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
              >
                All
              </button>
              {subjectList.map((sub) => (
                <button
                  key={sub.code}
                  onClick={() => setSelSubject(sub.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selSubject === sub.name ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
                >
                  <span className="opacity-50 mr-1 hidden sm:inline">
                    {sub.code}
                  </span>
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600">
          {filtered.length} file{filtered.length !== 1 ? "s" : ""} match filters
        </p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-400" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <FolderOpen size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No files found. Try different filters.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([branch, sems]) => (
          <div key={branch} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-8 h-8 ${BRANCH_ICON[branch] || "bg-gray-700"} rounded-lg flex items-center justify-center`}
              >
                <FolderOpen size={15} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-white">{branch}</h2>
            </div>
            {Object.entries(sems).map(([sem, subjects]) => (
              <div key={sem} className="ml-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {sem}
                </p>
                <div className="space-y-2">
                  {Object.entries(subjects).map(([subName, units]) => {
                    const total = Object.values(units).flat().length;
                    const key = `${branch}-${sem}-${subName}`;
                    const isOpen = expandedSub === key;
                    return (
                      <div
                        key={subName}
                        className="border border-gray-800 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedSub(isOpen ? null : key)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
                        >
                          <BookOpen
                            size={13}
                            className="text-teal-400 shrink-0"
                          />
                          <span className="text-sm font-medium text-white flex-1 truncate">
                            {subName}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${total > 0 ? "bg-teal-900/60 text-teal-300 border border-teal-800" : "bg-gray-800 text-gray-600"}`}
                          >
                            {total} file{total !== 1 ? "s" : ""}
                          </span>
                          {isOpen ? (
                            <ChevronDown
                              size={13}
                              className="text-gray-500 shrink-0"
                            />
                          ) : (
                            <ChevronRight
                              size={13}
                              className="text-gray-500 shrink-0"
                            />
                          )}
                        </button>
                        {isOpen && (
                          <div className="bg-gray-950 border-t border-gray-800 p-3 space-y-3">
                            {[
                              "Unit 1",
                              "Unit 2",
                              "Unit 3",
                              "Unit 4",
                              "Unit 5",
                            ].map((unit) => {
                              const uFiles = units[unit] || [];
                              return (
                                <div key={unit}>
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">
                                    {unit}
                                  </p>
                                  {uFiles.length === 0 ? (
                                    <p className="text-xs text-gray-700 px-3 py-2 bg-gray-800/30 rounded-lg">
                                      No notes uploaded yet
                                    </p>
                                  ) : (
                                    uFiles.map((f) => (
                                      <div
                                        key={f._id || f.id}
                                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800/60 hover:bg-gray-800 rounded-lg mb-1 transition-colors"
                                      >
                                        <FileText
                                          size={12}
                                          className="text-indigo-400 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-200 truncate">
                                            {f.original_name}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            {(f.size / 1024 / 1024).toFixed(2)}{" "}
                                            MB
                                          </p>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                          {canPreview(f) && (
                                            <a
                                              href={fileUrl(f)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1.5 rounded-lg transition-colors"
                                            >
                                              <Eye size={11} />
                                              <span className="hidden sm:inline ml-0.5">
                                                View
                                              </span>
                                            </a>
                                          )}
                                          <a
                                            href={fileUrl(f)}
                                            download={f.original_name}
                                            className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1.5 rounded-lg transition-colors"
                                          >
                                            <Download size={11} />
                                            <span className="hidden sm:inline ml-0.5">
                                              Download
                                            </span>
                                          </a>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ── SEARCH PAGE ───────────────────────────────────────────────────────────────
function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [exp, setExp] = useState("");
  const [loading, setLoading] = useState(false);

  const EXAMPLES = [
    "MCA software engineering unit 1",
    "MCA cloud computing unit 2",
    "MCA operating system unit 3",
    "MCA python programming unit 1",
  ];

  async function handleSearch(q) {
    const sq = (q || query).trim();
    if (!sq) return;
    setLoading(true);
    try {
      const res = await searchAPI.search(sq);
      setResults(res.data.results);
      setExp(res.data.explanation);
    } catch {
      setResults([]);
      setExp("Search failed. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-teal-400" /> Smart Search
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Search notes by subject, unit, or topic
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 focus-within:border-teal-500 transition-colors">
          <Search size={15} className="text-gray-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='e.g. "software engineering unit 1"'
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Search size={15} />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {!results && (
        <div className="mb-5">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
            Examples
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  handleSearch(ex);
                }}
                className="text-xs bg-gray-900 border border-gray-800 hover:border-teal-700 hover:text-teal-300 text-gray-400 px-3 py-2 rounded-lg transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-10">
          <Loader2
            size={24}
            className="text-teal-400 animate-spin mx-auto mb-2"
          />
          <p className="text-gray-400 text-sm">Searching...</p>
        </div>
      )}

      {results !== null && !loading && (
        <div>
          {exp && (
            <div
              className={`rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-sm
              ${results.length > 0 ? "bg-teal-950/40 border border-teal-800/50 text-teal-300" : "bg-amber-950/40 border border-amber-800/50 text-amber-300"}`}
            >
              {results.length > 0 ? (
                <Sparkles size={13} className="shrink-0 mt-0.5" />
              ) : (
                <span>📭</span>
              )}
              <p>{exp}</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((f) => (
                <FileCard key={f._id || f.id} file={f} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function StudentSection() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  const pages = {
    dashboard: <DashboardPage user={user} />,
    news: <NewsPage user={user} />,
    allnotes: <AllNotesPage />,
    videos: <StudentVideoLecture user={user} />,
    search: <SearchPage />,
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        logout={logout}
        open={sideOpen}
        setOpen={setSideOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar page={page} setOpen={setSideOpen} user={user} />
        <main className="flex-1 overflow-y-auto">{pages[page]}</main>
      </div>
    </div>
  );
}
