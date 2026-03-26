import React, { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Search,
  Copy,
  GraduationCap,
  LogOut,
  User,
  Menu,
  X,
  Video,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import Browse from "./pages/Browse";
import SearchPage from "./pages/Search";
import Duplicates from "./pages/Duplicates";
import TeacherVideoLecture from "./pages/TeacherVideoLecture";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "upload", icon: Upload, label: "Upload Notes" },
  { id: "browse", icon: FolderOpen, label: "Browse" },
  { id: "videos", icon: Video, label: "Video Lecture" },
  { id: "search", icon: Search, label: "Smart Search" },
  { id: "duplicates", icon: Copy, label: "Duplicates" },
];

function Sidebar({ page, setPage, user, logout, open, setOpen }) {
  function go(id) {
    setPage(id);
    setOpen(false);
  }
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex lg:shrink-0
      `}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">
                School of Professional Studies
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Teacher Portal</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-3 mt-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-700 rounded-full flex items-center justify-center shrink-0">
              <User size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name}
              </p>
              <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-2 py-0.5">
                Teacher
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${page === id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

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

export default function TeacherApp() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const current = NAV.find((n) => n.id === page);

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    upload: <UploadPage />,
    browse: <Browse />,
    search: <SearchPage />,
    duplicates: <Duplicates />,
    videos: <TeacherVideoLecture />,
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
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <button
            onClick={() => setSideOpen(true)}
            className="text-gray-400 hover:text-white p-1"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {current && (
              <current.icon size={16} className="text-indigo-400 shrink-0" />
            )}
            <p className="text-sm font-semibold text-white truncate">
              {current?.label}
            </p>
          </div>
          <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-2 py-0.5 shrink-0">
            {user?.name?.split(" ")[0]}
          </span>
        </div>
        <main className="flex-1 overflow-y-auto">{pages[page]}</main>
      </div>
    </div>
  );
}
