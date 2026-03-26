import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Search,
  Eye,
  Clock,
  X,
  MessageSquare,
  Loader2,
  Link,
  Video,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { videosAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";

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

const BRANCH_STYLE = {
  MCA: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
  BCA: "bg-blue-900/50 text-blue-300 border-blue-700",
  BSc_ITM: "bg-teal-900/50 text-teal-300 border-teal-700",
};

// ── Video card (YT thumbnail style) ───────────────────────────────────────────
function VideoThumb({ video, onClick }) {
  return (
    <div className="cursor-pointer group" onClick={() => onClick(video)}>
      {/* Thumbnail */}
      <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video mb-3 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-indigo-600/80 transition-colors">
          <Play size={22} className="text-white ml-1" />
        </div>
        {video.subject && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {video.subject}
          </div>
        )}
        {video.unit && (
          <div className="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-xs px-1.5 py-0.5 rounded">
            {video.unit}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {(video.uploadedBy || "T").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {video.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {video.uploadedBy || "Teacher"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
            <Eye size={10} />
            {video.views || 0}
            <span>·</span>
            {timeAgo(video.uploadedAt)}
            {video.branch && (
              <>
                <span>·</span>
                <span className="text-indigo-400">{video.branch}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full video player (YT watch page style) ────────────────────────────────────
function VideoWatch({ video, allVideos, onClose, onPlay, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    videosAPI
      .getComments(video._id)
      .then((r) => setComments(r.data))
      .catch(console.error);
    window.scrollTo(0, 0);
  }, [video._id]);

  async function postComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await videosAPI.addComment(video._id, {
        text: newComment,
        authorName: user?.name || "Student",
        authorRole: "student",
      });
      setComments((c) => [res.data.comment, ...c]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed");
    }
    setPosting(false);
  }

  const links = Array.isArray(video.externalLinks) ? video.externalLinks : [];
  const related = allVideos
    .filter(
      (v) =>
        v._id !== video._id &&
        (v.branch === video.branch || v.subject === video.subject),
    )
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Back bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 flex items-center gap-1.5 text-sm"
        >
          <ChevronRight size={16} className="rotate-180" /> Back
        </button>
        <p className="text-sm font-medium text-white truncate flex-1">
          {video.title}
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Main video column */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: "55vh" }}
              src={videosAPI.streamUrl(video.videoFile)}
            >
              Your browser does not support video.
            </video>
          </div>

          {/* Title & meta */}
          <h1 className="text-lg font-bold text-white mb-2">{video.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {video.views || 0} views
            </span>
            <span>{timeAgo(video.uploadedAt)}</span>
            {video.branch && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${BRANCH_STYLE[video.branch] || "bg-gray-800 text-gray-400 border-gray-700"}`}
              >
                {video.branch}
              </span>
            )}
            {video.semester && (
              <span className="bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                {video.semester}
              </span>
            )}
            {video.subject && (
              <span className="bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                {video.subject}
              </span>
            )}
            {video.unit && (
              <span className="bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                {video.unit}
              </span>
            )}
          </div>

          {/* Teacher info */}
          <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-white shrink-0">
              {(video.uploadedBy || "T").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {video.uploadedBy || "Teacher"}
              </p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-white mb-2">
                Description
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* External links */}
          {links.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                <Link size={14} className="text-indigo-400" /> Resources & Links
              </p>
              <div className="space-y-2">
                {links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Link size={13} className="text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      {l.label && (
                        <p className="text-sm font-medium text-white truncate">
                          {l.label}
                        </p>
                      )}
                      <p className="text-xs text-indigo-400 truncate">
                        {l.url}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments / Doubts */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={15} className="text-teal-400" />
              Ask Doubts ({comments.length})
            </p>
            {/* Post comment */}
            <div className="flex gap-2 mb-5">
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {(user?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                  placeholder="Ask your doubt here..."
                  className="w-full bg-transparent border-b border-gray-700 focus:border-teal-500 text-sm text-white placeholder-gray-600 outline-none pb-1.5 transition-colors"
                />
                {newComment.trim() && (
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={() => setNewComment("")}
                      className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={postComment}
                      disabled={posting}
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {posting && (
                        <Loader2 size={11} className="animate-spin" />
                      )}{" "}
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Comment list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  No comments yet. Ask your doubt!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c._id}>
                    {/* Comment */}
                    <div className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0
                        ${c.authorRole === "teacher" ? "bg-indigo-700" : "bg-teal-700"}`}
                      >
                        {c.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-white">
                            {c.authorName}
                          </span>
                          {c.authorRole === "teacher" ? (
                            <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-1.5 py-0.5">
                              Teacher
                            </span>
                          ) : (
                            <span className="text-xs bg-teal-900/50 text-teal-300 border border-teal-800 rounded-full px-1.5 py-0.5">
                              Student
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{c.text}</p>
                      </div>
                    </div>

                    {/* Teacher replies */}
                    {(c.replies || []).length > 0 && (
                      <div className="ml-11 mt-2 space-y-2">
                        {(c.replies || []).map((r) => (
                          <div
                            key={r.id}
                            className="flex gap-2 bg-indigo-950/40 border border-indigo-900/40 rounded-xl px-3 py-2.5"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {r.authorName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-xs font-semibold text-white">
                                  {r.authorName}
                                </span>
                                <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-1.5 py-0.5">
                                  Teacher Reply
                                </span>
                                <span className="text-xs text-gray-600">
                                  {timeAgo(r.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-indigo-100">
                                {r.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related videos sidebar */}
        {related.length > 0 && (
          <div className="lg:w-80 shrink-0">
            <p className="text-sm font-semibold text-gray-400 mb-3">
              Related Videos
            </p>
            <div className="space-y-3">
              {related.map((v) => (
                <div
                  key={v._id}
                  className="flex gap-3 cursor-pointer group"
                  onClick={() => onPlay(v)}
                >
                  <div className="w-32 h-20 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 relative">
                    <Play
                      size={16}
                      className="text-white group-hover:text-indigo-400 transition-colors"
                    />
                    {v.subject && (
                      <div
                        className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded"
                        style={{ fontSize: "10px" }}
                      >
                        {v.subject}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {v.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{v.uploadedBy}</p>
                    <p className="text-xs text-gray-700">
                      <Eye size={9} className="inline mr-0.5" />
                      {v.views || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Student Video Page ─────────────────────────────────────────────────────
export default function StudentVideoLecture({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "my" | branch

  useEffect(() => {
    videosAPI
      .list({})
      .then((r) => setVideos(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos
    .filter((v) => {
      if (filter === "my")
        return v.branch === user?.branch && v.semester === user?.semester;
      if (filter !== "all") return v.branch === filter;
      return true;
    })
    .filter((v) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (v.title || "").toLowerCase().includes(q) ||
        (v.subject || "").toLowerCase().includes(q) ||
        (v.branch || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
      );
    });

  if (playing)
    return (
      <VideoWatch
        video={playing}
        allVideos={videos}
        onClose={() => setPlaying(null)}
        onPlay={setPlaying}
        user={user}
      />
    );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Video size={20} className="text-indigo-400" /> Video Lectures
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Watch lecture videos uploaded by teachers
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-indigo-500 transition-colors">
          <Search size={15} className="text-gray-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos by title, subject..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {[
            ["all", "All"],
            ["my", "My Semester"],
            ["MCA", "MCA"],
            ["BCA", "BCA"],
            ["BSc_ITM", "BSc ITM"],
          ].map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border
                ${filter === id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Video size={40} className="mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400 font-medium">
            {query
              ? `No videos found for "${query}"`
              : "No videos uploaded yet"}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Your teachers haven't uploaded any videos yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((v) => (
            <VideoThumb key={v._id} video={v} onClick={setPlaying} />
          ))}
        </div>
      )}
    </div>
  );
}
