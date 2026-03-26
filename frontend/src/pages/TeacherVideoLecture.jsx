import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Upload as UploadIcon,
  LayoutDashboard,
  Play,
  Trash2,
  Edit2,
  Eye,
  X,
  Plus,
  Link,
  MessageSquare,
  Loader2,
  ChevronRight,
  Clock,
  Search,
  Check,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { videosAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ALL_COURSES } from "../data/courseStructure";

const BRANCHES = ALL_COURSES.map((c) => c.branch);
function getSems(branch) {
  return (
    ALL_COURSES.find((c) => c.branch === branch)?.semesters.map((s) => s.sem) ||
    []
  );
}
function getSubs(branch, sem) {
  return (
    ALL_COURSES.find((c) => c.branch === branch)?.semesters.find(
      (s) => s.sem === sem,
    )?.subjects || []
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
function fmtSize(b) {
  if (!b) return "";
  if (b > 1024 * 1024 * 1024)
    return (b / 1024 / 1024 / 1024).toFixed(1) + " GB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

// ── Video Card ─────────────────────────────────────────────────────────────────
function VideoCard({ video, onDelete, onEdit, onPlay }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
      {/* Thumbnail / play area */}
      <div
        className="relative bg-gray-800 aspect-video cursor-pointer flex items-center justify-center"
        onClick={() => onPlay(video)}
      >
        <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-indigo-600/80 transition-colors">
          <Play size={24} className="text-white ml-1" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {fmtSize(video.videoSize)}
        </div>
        {video.subject && (
          <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-xs px-2 py-0.5 rounded-full">
            {video.subject}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white line-clamp-2 mb-1">
          {video.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Eye size={11} /> {video.views || 0} views
          <span>·</span>
          <Clock size={11} /> {timeAgo(video.uploadedAt)}
        </div>
        {video.branch && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-2 py-0.5">
              {video.branch}
            </span>
            {video.semester && (
              <span className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                {video.semester}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={() => onPlay(video)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition-colors font-medium"
          >
            <Play size={12} /> Watch
          </button>
          <button
            onClick={() => onEdit(video)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(video._id)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Video Player Modal ─────────────────────────────────────────────────────────
function VideoPlayer({ video, onClose, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    videosAPI
      .getComments(video._id)
      .then((r) => setComments(r.data))
      .catch(console.error);
  }, [video._id]);

  async function postComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await videosAPI.addComment(video._id, {
        text: newComment,
        authorName: user?.name || "Teacher",
        authorRole: user?.role || "teacher",
      });
      setComments((c) => [res.data.comment, ...c]);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    }
    setPosting(false);
  }

  async function delComment(cid) {
    await videosAPI.deleteComment(video._id, cid);
    setComments((c) => c.filter((x) => x._id !== cid));
  }

  async function postReply(commentId) {
    if (!replyText.trim()) return;
    setPostingReply(true);
    try {
      const res = await videosAPI.addReply(video._id, commentId, {
        text: replyText,
        authorName: user?.name || "Teacher",
      });
      setComments((c) =>
        c.map((cm) =>
          cm._id === commentId ? { ...cm, replies: res.data.replies } : cm,
        ),
      );
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    }
    setPostingReply(false);
  }

  async function deleteReply(commentId, replyId) {
    try {
      const res = await videosAPI.deleteReply(video._id, commentId, replyId);
      setComments((c) =>
        c.map((cm) =>
          cm._id === commentId ? { ...cm, replies: res.data.replies } : cm,
        ),
      );
    } catch {
      toast.error("Failed to delete reply");
    }
  }

  const links = Array.isArray(video.externalLinks) ? video.externalLinks : [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>
        <p className="text-sm font-semibold text-white flex-1 truncate">
          {video.title}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
          <Eye size={12} /> {video.views || 0} views
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 max-w-6xl mx-auto w-full gap-0 lg:gap-6 p-0 lg:p-6">
        {/* Video + info */}
        <div className="flex-1 min-w-0">
          <video
            ref={videoRef}
            controls
            className="w-full bg-black"
            style={{ maxHeight: "60vh" }}
            src={videosAPI.streamUrl(video.videoFile)}
          >
            Your browser does not support the video tag.
          </video>

          <div className="p-4 lg:p-0 lg:mt-4">
            <h2 className="text-lg font-bold text-white mb-2">{video.title}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Eye size={11} /> {video.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {timeAgo(video.uploadedAt)}
              </span>
              {video.branch && (
                <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-2 py-0.5">
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

            {video.description && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}

            {links.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Link size={11} /> External Resources
                </p>
                <div className="space-y-2">
                  {links.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Link size={12} className="shrink-0" />
                      <span className="truncate">{l.label || l.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare size={15} className="text-indigo-400" /> Doubts &
                Comments ({comments.length})
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                  placeholder="Ask a doubt or leave a comment..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={postComment}
                  disabled={posting || !newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  {posting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <MessageSquare size={13} />
                  )}{" "}
                  Post
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-4">
                    No student doubts yet.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id}>
                      {/* Comment */}
                      <div className="flex gap-2.5 group">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                          ${c.authorRole === "teacher" ? "bg-indigo-700 text-white" : "bg-teal-700 text-white"}`}
                        >
                          {c.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
                          <p className="text-sm text-gray-300 mb-1.5">
                            {c.text}
                          </p>
                          {/* Reply button */}
                          {c.authorRole !== "teacher" && (
                            <button
                              onClick={() => {
                                setReplyingTo(
                                  replyingTo === c._id ? null : c._id,
                                );
                                setReplyText("");
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare size={11} /> Reply
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => delComment(c._id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1 shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Existing replies */}
                      {(c.replies || []).length > 0 && (
                        <div className="ml-9 mt-2 space-y-2">
                          {(c.replies || []).map((r) => (
                            <div
                              key={r.id}
                              className="flex gap-2 group/reply bg-indigo-950/30 border border-indigo-900/40 rounded-lg px-3 py-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {r.authorName?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-white">
                                    {r.authorName}
                                  </span>
                                  <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full px-1.5 py-0.5">
                                    Teacher
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {timeAgo(r.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  {r.text}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteReply(c._id, r.id)}
                                className="opacity-0 group-hover/reply:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1 shrink-0"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input box */}
                      {replyingTo === c._id && (
                        <div className="ml-9 mt-2 flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Replying to ${c.authorName}...`}
                              rows={2}
                              className="w-full bg-gray-800 border border-indigo-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 resize-none transition-colors"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-1.5 justify-end">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => postReply(c._id)}
                                disabled={postingReply || !replyText.trim()}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                              >
                                {postingReply ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <MessageSquare size={11} />
                                )}
                                Post Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Modal ───────────────────────────────────────────────────────────────
function UploadModal({ onClose, onDone, user }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    branch: "MCA",
    semester: "1st Sem",
    subject: "",
    unit: "",
  });
  const [links, setLinks] = useState([{ label: "", url: "" }]);
  const [videoFile, setVF] = useState(null);
  const [uploading, setUpl] = useState(false);
  const [progress, setProg] = useState(0);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const subs = getSubs(form.branch, form.semester);
  const sems = getSems(form.branch);

  function addLink() {
    setLinks((l) => [...l, { label: "", url: "" }]);
  }
  function removeLink(i) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
  }
  function setLink(i, k, v) {
    setLinks((l) =>
      l.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );
  }

  async function handleUpload() {
    if (!form.title.trim()) return toast.error("Title required");
    if (!videoFile) return toast.error("Select a video file");
    setUpl(true);
    const fd = new FormData();
    fd.append("video", videoFile);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("branch", form.branch);
    fd.append("semester", form.semester);
    fd.append("subject", form.subject);
    fd.append("unit", form.unit);
    fd.append(
      "externalLinks",
      JSON.stringify(links.filter((l) => l.url.trim())),
    );
    fd.append("teacherName", user?.name || "Teacher");
    fd.append("teacherId", user?.id || "");
    try {
      await videosAPI.upload(fd, setProg);
      toast.success("Video uploaded!");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    }
    setUpl(false);
  }

  const cls =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Video size={16} className="text-indigo-400" /> Upload Video Lecture
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Video file */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Video File *</p>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${videoFile ? "border-indigo-600 bg-indigo-950/20" : "border-gray-700 hover:border-gray-600"}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVF(e.target.files[0])}
              />
              {videoFile ? (
                <div>
                  <Video size={24} className="text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">
                    {videoFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fmtSize(videoFile.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <UploadIcon
                    size={24}
                    className="text-gray-500 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-400">
                    Click to select video (MP4, AVI, MOV, MKV)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Max 2GB</p>
                </div>
              )}
            </div>
          </div>

          <input
            value={form.title}
            onChange={set("title")}
            placeholder="Video Title *"
            className={cls}
          />
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Description (optional)"
            rows={3}
            className={cls + " resize-none"}
          />

          {/* Branch / Sem / Subject / Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Branch</p>
              <select
                value={form.branch}
                onChange={(e) => {
                  set("branch")(e);
                  setForm((f) => ({
                    ...f,
                    semester: getSems(e.target.value)[0] || "",
                    subject: "",
                  }));
                }}
                className={cls}
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Semester</p>
              <select
                value={form.semester}
                onChange={(e) => {
                  set("semester")(e);
                  setForm((f) => ({ ...f, subject: "" }));
                }}
                className={cls}
              >
                {sems.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <select
                value={form.subject}
                onChange={set("subject")}
                className={cls}
              >
                <option value="">Select subject</option>
                {subs.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Unit</p>
              <select value={form.unit} onChange={set("unit")} className={cls}>
                <option value="">Select unit</option>
                {["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* External links */}
          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Link size={11} /> External Links (optional)
            </p>
            {links.map((l, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={l.label}
                  onChange={(e) => setLink(i, "label", e.target.value)}
                  placeholder="Label (e.g. Reference Notes)"
                  className={cls + " flex-1"}
                />
                <input
                  value={l.url}
                  onChange={(e) => setLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className={cls + " flex-1"}
                />
                <button
                  onClick={() => removeLink(i)}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
            >
              <Plus size={12} /> Add link
            </button>
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !videoFile || !form.title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Video size={14} />
              )}
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ video, onClose, onDone }) {
  const [form, setForm] = useState({
    title: video.title || "",
    description: video.description || "",
    branch: video.branch || "MCA",
    semester: video.semester || "1st Sem",
    subject: video.subject || "",
    unit: video.unit || "",
  });
  const [links, setLinks] = useState(
    Array.isArray(video.externalLinks) && video.externalLinks.length > 0
      ? video.externalLinks
      : [{ label: "", url: "" }],
  );
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const sems = getSems(form.branch);
  const subs = getSubs(form.branch, form.semester);

  function addLink() {
    setLinks((l) => [...l, { label: "", url: "" }]);
  }
  function removeLink(i) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
  }
  function setLink(i, k, v) {
    setLinks((l) =>
      l.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    );
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("branch", form.branch);
      fd.append("semester", form.semester);
      fd.append("subject", form.subject);
      fd.append("unit", form.unit);
      fd.append(
        "externalLinks",
        JSON.stringify(links.filter((l) => l.url.trim())),
      );
      await videosAPI.update(video._id, {
        title: form.title,
        description: form.description,
        branch: form.branch,
        semester: form.semester,
        subject: form.subject,
        unit: form.unit,
        externalLinks: JSON.stringify(links.filter((l) => l.url.trim())),
      });
      toast.success("Video updated!");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
    setSaving(false);
  }

  const cls =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Edit2 size={16} className="text-indigo-400" /> Edit Video Details
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Title *</p>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="Video title"
              className={cls}
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Description (optional)"
              rows={3}
              className={cls + " resize-none"}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Branch</p>
              <select
                value={form.branch}
                onChange={(e) => {
                  set("branch")(e);
                  setForm((f) => ({
                    ...f,
                    semester: getSems(e.target.value)[0] || "",
                    subject: "",
                  }));
                }}
                className={cls}
              >
                {["MCA", "BCA", "BSc_ITM"].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Semester</p>
              <select
                value={form.semester}
                onChange={(e) => {
                  set("semester")(e);
                  setForm((f) => ({ ...f, subject: "" }));
                }}
                className={cls}
              >
                {sems.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <select
                value={form.subject}
                onChange={set("subject")}
                className={cls}
              >
                <option value="">Select subject</option>
                {subs.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Unit</p>
              <select value={form.unit} onChange={set("unit")} className={cls}>
                <option value="">Select unit</option>
                {["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Link size={11} /> External Links
            </p>
            {links.map((l, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={l.label}
                  onChange={(e) => setLink(i, "label", e.target.value)}
                  placeholder="Label"
                  className={cls + " flex-1"}
                />
                <input
                  value={l.url}
                  onChange={(e) => setLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className={cls + " flex-1"}
                />
                <button
                  onClick={() => removeLink(i)}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus size={12} /> Add link
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Teacher Video Studio ───────────────────────────────────────────────────
export default function TeacherVideoLecture() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await videosAPI.list({ teacherId: user?.id });
      setVideos(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function deleteVideo(id) {
    if (!confirm("Delete this video permanently?")) return;
    await videosAPI.delete(id);
    toast.success("Deleted");
    load();
  }

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  const STUDIO_TABS = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "content", icon: Video, label: "Content" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Studio sub-nav */}
      <div className="flex items-center gap-1 px-4 sm:px-6 pt-4 border-b border-gray-800 overflow-x-auto shrink-0">
        {STUDIO_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
              ${tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
        <button
          onClick={() => setShowUpload(true)}
          className="ml-auto mb-1 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Plus size={13} /> Upload
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Dashboard tab */}
        {tab === "dashboard" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-5">Video Studio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: "Total Videos",
                  value: videos.length,
                  color: "bg-indigo-600",
                },
                {
                  label: "Total Views",
                  value: totalViews,
                  color: "bg-purple-600",
                },
                {
                  label: "Latest Upload",
                  value: videos[0] ? timeAgo(videos[0].uploadedAt) : "—",
                  color: "bg-teal-600",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                >
                  <div
                    className={`w-8 h-8 ${c.color} rounded-lg flex items-center justify-center mb-2`}
                  >
                    <Video size={15} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-white">{c.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Recent videos */}
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Videos
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-indigo-400" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                <Video size={36} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">
                  No videos uploaded yet
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-3 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mx-auto"
                >
                  <Plus size={14} /> Upload your first video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.slice(0, 6).map((v) => (
                  <VideoCard
                    key={v._id}
                    video={v}
                    onDelete={deleteVideo}
                    onEdit={setEditing}
                    onPlay={setPlaying}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content tab */}
        {tab === "content" && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">
                Your Videos ({videos.length})
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-indigo-400" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                <Video size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-3">No videos yet</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mx-auto"
                >
                  <Plus size={14} /> Upload Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v) => (
                  <VideoCard
                    key={v._id}
                    video={v}
                    onDelete={deleteVideo}
                    onEdit={setEditing}
                    onPlay={setPlaying}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => {
            setShowUpload(false);
            load();
          }}
          user={user}
        />
      )}
      {playing && (
        <VideoPlayer
          video={playing}
          onClose={() => setPlaying(null)}
          user={user}
        />
      )}
      {editing && (
        <EditModal
          video={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
