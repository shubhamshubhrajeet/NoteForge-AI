import React, { useState } from "react";
import {
  Search as SearchIcon,
  Loader2,
  Sparkles,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import { searchAPI } from "../api/client";

const EXAMPLES = [
  "MCA software engineering unit 1",
  "MCA 4th sem cloud computing unit 2",
  "MCA operating system unit 3",
  "MCA python programming unit 1",
];

const BRANCH_COLORS = {
  MCA: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
  BCA: "bg-blue-900/50 text-blue-300 border-blue-700",
  BSc_ITM: "bg-teal-900/50 text-teal-300 border-teal-700",
};

function fileUrl(file) {
  return `/api/download/${file._id || file.id}`;
}

function canPreview(file) {
  const m = (file.mime_type || "").toLowerCase();
  const e = (file.original_name || "").split(".").pop().toLowerCase();
  return m.includes("pdf") || e === "pdf" || m.startsWith("image/");
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(q) {
    const sq = (q || query).trim();
    if (!sq) return;
    setLoading(true);
    try {
      const res = await searchAPI.search(sq);
      setResults(res.data.results);
      setExplanation(res.data.explanation);
    } catch (e) {
      setResults([]);
      setExplanation("Search failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles size={20} className="text-teal-400" /> Smart Search
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Search notes by subject, unit, or topic
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-teal-500 transition-colors">
          <SearchIcon size={16} className="text-gray-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='e.g. "MCA software engineering unit 1"'
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <SearchIcon size={15} />
          )}
          Search
        </button>
      </div>

      {/* Example queries */}
      {!results && (
        <div className="mb-6">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
            Try these examples
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <Loader2
            size={28}
            className="text-teal-400 animate-spin mx-auto mb-3"
          />
          <p className="text-gray-400 text-sm">Searching notes...</p>
        </div>
      )}

      {/* Results */}
      {results !== null && !loading && (
        <div>
          {/* Explanation */}
          {explanation && (
            <div
              className={`rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-sm
              ${
                results.length > 0
                  ? "bg-teal-950/40 border border-teal-800/50 text-teal-300"
                  : "bg-amber-950/40 border border-amber-800/50 text-amber-300"
              }`}
            >
              {results.length > 0 ? (
                <Sparkles size={14} className="text-teal-400 shrink-0 mt-0.5" />
              ) : (
                <span className="shrink-0">📭</span>
              )}
              <p>{explanation}</p>
            </div>
          )}

          {/* File results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((file) => (
                <div
                  key={file._id || file.id}
                  className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <FileText size={16} className="text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.original_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRANCH_COLORS[file.branch] || "bg-gray-800 text-gray-400 border-gray-700"}`}
                      >
                        {file.branch}
                      </span>
                      <span className="text-xs text-gray-500">
                        {file.semester || file.year}
                      </span>
                      {file.subject && file.subject !== "Unknown" && (
                        <span className="text-xs text-gray-400 font-medium">
                          · {file.subject}
                        </span>
                      )}
                      {file.unit && file.unit !== "Unknown" && (
                        <span className="text-xs text-gray-600">
                          · {file.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {canPreview(file) && (
                      <a
                        href={fileUrl(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <Eye size={11} /> View
                      </a>
                    )}
                    <a
                      href={fileUrl(file)}
                      download={file.original_name}
                      className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <Download size={11} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
