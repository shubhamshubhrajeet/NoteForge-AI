import React, { useState } from "react";
import {
  FileText,
  Image,
  Trash2,
  RefreshCw,
  Tag,
  BookOpen,
  Download,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { filesAPI, aiAPI } from "../api/client";

const BRANCH_COLORS = {
  MCA: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
  BCA: "bg-blue-900/50 text-blue-300 border-blue-700",
  BSc_ITM: "bg-teal-900/50 text-teal-300 border-teal-700",
  Unknown: "bg-gray-800 text-gray-500 border-gray-700",
};

const SEM_COLORS = {
  "1st Sem": "bg-yellow-900/40 text-yellow-300",
  "2nd Sem": "bg-orange-900/40 text-orange-300",
  "3rd Sem": "bg-red-900/40 text-red-300",
  "4th Sem": "bg-pink-900/40 text-pink-300",
  "5th Sem": "bg-purple-900/40 text-purple-300",
  "6th Sem": "bg-blue-900/40 text-blue-300",
  Unknown: "bg-gray-800 text-gray-500",
};

function getDownloadUrl(file) {
  const id = file._id || file.id;
  return "/api/download/" + id;
}

function canPreview(file) {
  const mime = (file.mime_type || "").toLowerCase();
  const ext = (file.original_name || "").split(".").pop().toLowerCase();
  return (
    mime === "application/pdf" || ext === "pdf" || mime.startsWith("image/")
  );
}

function PreviewModal({ file, onClose }) {
  const url = getDownloadUrl(file);
  const mime = (file.mime_type || "").toLowerCase();
  const ext = (file.original_name || "").split(".").pop().toLowerCase();
  const isImg =
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-white truncate max-w-lg">
          {file.original_name}
        </p>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <a
            href={url}
            download={file.original_name}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isImg ? (
          <img
            src={url}
            alt={file.original_name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <iframe
            src={url}
            title={file.original_name}
            className="w-full rounded-lg bg-white"
            style={{ height: "80vh" }}
          />
        )}
      </div>
    </div>
  );
}

export default function FileCard({ file, onDelete, onRecategorize }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const fileId = file._id || file.id;
  const tags = Array.isArray(file.tags) ? file.tags : [];
  const sem = file.semester || file.year || "Unknown";
  const isUnknown = file.branch === "Unknown" || file.subject === "Unknown";
  const showPreview = canPreview(file);
  const dlUrl = getDownloadUrl(file);
  const sizeMB = file.size ? (file.size / (1024 * 1024)).toFixed(2) : "?";

  async function handleDelete() {
    if (!confirm("Delete this file permanently?")) return;
    setLoading(true);
    try {
      await filesAPI.delete(fileId);
      toast.success("File deleted");
      onDelete(fileId);
    } catch {
      toast.error("Delete failed");
    }
    setLoading(false);
  }

  async function handleRecategorize() {
    setLoading(true);
    try {
      const res = await aiAPI.recategorize(fileId, file.remarks || "");
      const cat = res.data.category;
      toast.success(
        "Fixed: " + (cat.subject || "?") + " / " + (cat.unit || "?"),
      );
      onRecategorize(fileId, {
        branch: cat.branch,
        semester: cat.semester,
        year: cat.semester,
        subject: cat.subject,
        unit: cat.unit,
        tags: cat.tags,
        summary: cat.summary,
      });
    } catch {
      toast.error("Re-categorization failed");
    }
    setLoading(false);
  }

  return (
    <>
      {preview && (
        <PreviewModal file={file} onClose={() => setPreview(false)} />
      )}
      <div
        className={
          isUnknown
            ? "bg-gray-900 border border-amber-900/60 hover:border-amber-700/60 rounded-xl p-4 transition-all group flex flex-col"
            : "bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all group flex flex-col"
        }
      >
        {isUnknown && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-400">
            <AlertTriangle size={11} /> Not categorized — hover and click the
            refresh icon to fix
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {(file.mime_type || "").startsWith("image/") ? (
              <Image size={16} className="text-pink-400 shrink-0" />
            ) : (
              <FileText size={16} className="text-indigo-400 shrink-0" />
            )}
            <span
              className="text-sm font-medium text-white truncate"
              title={file.original_name}
            >
              {file.original_name}
            </span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={handleRecategorize}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors"
              title="Fix categorization"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className={
              "text-xs px-2 py-0.5 rounded-full border font-medium " +
              (BRANCH_COLORS[file.branch] || BRANCH_COLORS.Unknown)
            }
          >
            {file.branch || "?"}
          </span>
          <span
            className={
              "text-xs px-2 py-0.5 rounded-full font-medium " +
              (SEM_COLORS[sem] || SEM_COLORS.Unknown)
            }
          >
            {sem}
          </span>
        </div>

        {file.subject && file.subject !== "Unknown" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-300 mb-1">
            <BookOpen size={11} className="text-gray-500 shrink-0" />
            <span className="font-medium">{file.subject}</span>
          </div>
        )}
        {file.unit && file.unit !== "Unknown" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Tag size={11} className="shrink-0" /> {file.unit}
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-800 text-gray-500 rounded px-1.5 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {file.remarks && (
          <p className="text-xs text-indigo-400/60 italic line-clamp-1 mb-1">
            "{file.remarks}"
          </p>
        )}

        <div className="flex-1" />

        <div className="pt-2.5 border-t border-gray-800 mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2.5">
            <span>{sizeMB} MB</span>
            <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            {showPreview && (
              <button
                onClick={() => setPreview(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-600 text-gray-300 hover:text-white text-xs py-2 rounded-lg transition-all font-medium"
              >
                <Eye size={12} /> View
              </button>
            )}
            <a
              href={dlUrl}
              download={file.original_name}
              className={
                "flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg transition-colors font-medium " +
                (showPreview ? "flex-1" : "w-full")
              }
            >
              <Download size={12} /> Download
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
