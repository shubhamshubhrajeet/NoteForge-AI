import React from "react";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Search,
  Copy,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "upload", icon: Upload, label: "Upload Files" },
  { id: "browse", icon: FolderOpen, label: "Browse" },
  { id: "search", icon: Search, label: "Smart Search" },
  { id: "duplicates", icon: Copy, label: "Duplicates" },
];

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-xs leading-tight">
              School of Professional Studies
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">AI-Powered VPS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              current === id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-2 text-xs">Branches</p>
          <div className="space-y-1">
            {[
              { name: "MCA", sems: "4 Semesters" },
              { name: "BCA", sems: "6 Semesters" },
              { name: "BSc ITM", sems: "6 Semesters" },
            ].map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <span className="bg-gray-700 text-gray-300 rounded px-2 py-0.5 text-xs">
                  {b.name}
                </span>
                <span className="text-gray-500 text-xs">{b.sems}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
