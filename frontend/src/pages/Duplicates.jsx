import React, { useState } from "react";
import { Copy, Loader2, Trash2, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { aiAPI } from "../api/client";

export default function Duplicates() {
  const [duplicates, setDuplicates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);

  async function scanDuplicates() {
    setLoading(true);
    try {
      const res = await aiAPI.findDuplicates();
      setDuplicates(res.data.duplicates);
      if (res.data.duplicates.length === 0) {
        toast.success("No duplicates found! Your library is clean.");
      } else {
        toast(`Found ${res.data.duplicates.length} potential duplicates`, { icon: "⚠️" });
      }
    } catch (e) {
      toast.error("Scan failed: " + e.message);
    }
    setLoading(false);
  }

  async function resolve(keepId, deleteId) {
    setResolving(deleteId);
    try {
      await aiAPI.resolveDuplicate(keepId, deleteId);
      setDuplicates(d => d.filter(pair => pair.file1.id !== deleteId && pair.file2.id !== deleteId));
      toast.success("Duplicate removed!");
    } catch {
      toast.error("Failed to resolve duplicate");
    }
    setResolving(null);
  }

  const confidenceColor = {
    high: "text-red-400 bg-red-900/30 border-red-800",
    medium: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
    low: "text-blue-400 bg-blue-900/30 border-blue-800",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Copy size={24} className="text-orange-400" /> Duplicate Detection
        </h1>
        <p className="text-gray-400 mt-1">AI finds files with same content across your library</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-900/50 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={24} className="text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">How duplicate detection works</h3>
            <p className="text-sm text-gray-400 mt-1">
              1. <strong className="text-gray-300">Hash matching</strong> — Exact duplicates caught at upload time via SHA-256<br/>
              2. <strong className="text-gray-300">Semantic matching</strong> — AI finds files with same branch+year+subject+unit<br/>
              3. <strong className="text-gray-300">You decide</strong> — Choose which file to keep, the other is deleted
            </p>
          </div>
        </div>
        <button
          onClick={scanDuplicates}
          disabled={loading}
          className="mt-4 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
          {loading ? "Scanning with AI..." : "Scan for Duplicates"}
        </button>
      </div>

      {duplicates !== null && (
        <div>
          {duplicates.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg">No duplicates found!</h3>
              <p className="text-gray-500 text-sm mt-1">Your library is clean and organized.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">{duplicates.length} duplicate pair{duplicates.length !== 1 ? "s" : ""} found</p>
              {duplicates.map((pair, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceColor[pair.confidence] || confidenceColor.medium}`}>
                      {pair.confidence} confidence
                    </span>
                    <p className="text-xs text-gray-500">{pair.reason}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[pair.file1, pair.file2].map((file, fi) => (
                      <div key={file.id} className="bg-gray-800 rounded-xl p-4">
                        <p className="text-sm font-medium text-white truncate mb-2">{file.original_name}</p>
                        <p className="text-xs text-gray-400">{file.branch} • {file.year} • {file.subject} • {file.unit}</p>
                        <p className="text-xs text-gray-500 mt-1">{file.size ? (file.size / 1024).toFixed(0) + " KB" : "?"} • {new Date(file.uploaded_at).toLocaleDateString()}</p>
                        <button
                          onClick={() => resolve(fi === 0 ? pair.file2.id : pair.file1.id, file.id)}
                          disabled={resolving === file.id}
                          className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {resolving === file.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Delete this one
                        </button>
                      </div>
                    ))}
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
