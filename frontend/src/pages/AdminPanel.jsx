import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Shield,
  BookOpen,
  Users,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Key,
  GraduationCap,
  Menu,
  ChevronDown,
  Check,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md my-4 sm:my-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Password cell with show/hide ──────────────────────────────────────────────
function PasswordCell({ password }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-mono text-gray-300">
        {show ? password : "••••••••"}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        className="text-gray-600 hover:text-gray-300 transition-colors p-0.5"
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("teachers");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // "add" | "edit-teacher" | "edit-student" | "change-pw"
  const [selected, setSelected] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving] = useState(false);

  // Teacher form
  const [tForm, setTForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPw: "",
  });
  // Student edit form
  const [sForm, setSForm] = useState({
    name: "",
    branch: "",
    semester: "",
    rollNo: "",
  });
  // Change password form
  const [pwForm, setPwForm] = useState({ password: "", confirmPw: "" });

  const setT = (k) => (e) => setTForm((f) => ({ ...f, [k]: e.target.value }));
  const setS = (k) => (e) => setSForm((f) => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        adminAPI.listTeachers(),
        adminAPI.listStudents(),
      ]);
      setTeachers(t.data);
      setStudents(s.data);
    } catch {
      toast.error("Failed to load data");
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openAddTeacher() {
    setSelected(null);
    setTForm({
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirmPw: "",
    });
    setModal("add");
  }

  function openEditTeacher(t) {
    setSelected(t);
    setTForm({
      name: t.name,
      email: t.email || "",
      phone: t.phone || "",
      username: t.username,
      password: t.plainPassword || "",
      confirmPw: "",
    });
    setModal("edit-teacher");
  }

  function openChangePw(item) {
    setSelected(item);
    setPwForm({ password: "", confirmPw: "" });
    setModal("change-pw");
  }

  function openEditStudent(s) {
    setSelected(s);
    setSForm({
      name: s.name,
      branch: s.branch || "",
      semester: s.semester || "",
      rollNo: s.rollNo || "",
    });
    setModal("edit-student");
  }

  async function saveTeacher() {
    if (!tForm.name || !tForm.username)
      return toast.error("Name and username required");
    if (modal === "add" && !tForm.password)
      return toast.error("Password required");
    if (tForm.password && tForm.password !== tForm.confirmPw)
      return toast.error("Passwords don't match");
    setSaving(true);
    try {
      const data = {
        name: tForm.name,
        email: tForm.email,
        phone: tForm.phone,
        username: tForm.username,
      };
      if (tForm.password) data.password = tForm.password;
      if (modal === "add") {
        await adminAPI.createTeacher(data);
        toast.success("Teacher created!");
      } else {
        await adminAPI.updateTeacher(selected._id, data);
        toast.success("Teacher updated!");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
    setSaving(false);
  }

  async function savePassword() {
    if (!pwForm.password) return toast.error("Enter new password");
    if (pwForm.password !== pwForm.confirmPw)
      return toast.error("Passwords don't match");
    if (pwForm.password.length < 4)
      return toast.error("Password too short (min 4 chars)");
    setSaving(true);
    try {
      await adminAPI.updateTeacher(selected._id, { password: pwForm.password });
      toast.success("Password changed!");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
    setSaving(false);
  }

  async function saveStudent() {
    setSaving(true);
    try {
      await adminAPI.updateStudent(selected._id, sForm);
      toast.success("Student updated!");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
    setSaving(false);
  }

  async function delTeacher(id) {
    if (!confirm("Delete this teacher? They will lose access immediately."))
      return;
    await adminAPI.deleteTeacher(id);
    toast.success("Teacher deleted");
    load();
  }

  async function delStudent(id) {
    if (!confirm("Delete this student?")) return;
    await adminAPI.deleteStudent(id);
    toast.success("Student deleted");
    load();
  }

  const BRANCHES = ["MCA", "BCA", "BSc_ITM"];
  const SEMS = {
    MCA: ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem"],
    BCA: ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem"],
    BSc_ITM: ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem"],
  };

  const inputCls =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-gray-500 hidden sm:block">
              School of Professional Studies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={13} />{" "}
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Teachers",
              value: teachers.length,
              icon: BookOpen,
              color: "bg-indigo-700",
            },
            {
              label: "Students",
              value: students.length,
              icon: Users,
              color: "bg-teal-700",
            },
            {
              label: "Admin",
              value: "Active",
              icon: Shield,
              color: "bg-red-700",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4"
            >
              <div
                className={`w-7 h-7 ${c.color} rounded-lg flex items-center justify-center mb-2`}
              >
                <c.icon size={13} className="text-white" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {c.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          {[
            ["teachers", "Teachers"],
            ["students", "Students"],
          ].map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? "bg-indigo-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
            >
              {lbl}
            </button>
          ))}
          {tab === "teachers" && (
            <button
              onClick={openAddTeacher}
              className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Add Teacher
            </button>
          )}
        </div>

        {/* ── TEACHERS TABLE ── */}
        {tab === "teachers" && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {[
                        "Name",
                        "Username",
                        "Password",
                        "Email",
                        "Phone",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-gray-600 text-sm"
                        >
                          No teachers yet. Click "Add Teacher" to create one.
                        </td>
                      </tr>
                    ) : (
                      teachers.map((t) => (
                        <tr
                          key={t._id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            {t.name}
                          </td>
                          <td className="px-4 py-3 text-indigo-300 font-mono text-xs">
                            {t.username}
                          </td>
                          <td className="px-4 py-3">
                            {t.plainPassword ? (
                              <PasswordCell password={t.plainPassword} />
                            ) : (
                              <span className="text-xs text-gray-600">
                                encrypted
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {t.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {t.phone || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditTeacher(t)}
                                title="Edit"
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-indigo-400 transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => openChangePw(t)}
                                title="Change password"
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-yellow-400 transition-colors"
                              >
                                <Key size={13} />
                              </button>
                              <button
                                onClick={() => delTeacher(t._id)}
                                title="Delete"
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {teachers.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-sm">
                  No teachers yet.
                </div>
              ) : (
                teachers.map((t) => (
                  <div
                    key={t._id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-indigo-300 font-mono mt-0.5">
                          @{t.username}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditTeacher(t)}
                          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openChangePw(t)}
                          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-yellow-400 transition-colors"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => delTeacher(t._id)}
                          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-16">Password</span>
                        {t.plainPassword ? (
                          <PasswordCell password={t.plainPassword} />
                        ) : (
                          <span className="text-gray-600">encrypted</span>
                        )}
                      </div>
                      {t.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-16">Email</span>
                          <span className="text-gray-300">{t.email}</span>
                        </div>
                      )}
                      {t.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-16">Phone</span>
                          <span className="text-gray-300">{t.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── STUDENTS TABLE ── */}
        {tab === "students" && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {[
                        "Name",
                        "Email",
                        "Branch / Sem",
                        "Roll No",
                        "Joined",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-gray-600 text-sm"
                        >
                          No students registered yet.
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr
                          key={s._id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {s.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-teal-900/50 text-teal-300 border border-teal-800 rounded-full px-2 py-0.5">
                              {s.branch} · {s.semester}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {s.rollNo || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditStudent(s)}
                                title="Edit"
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-indigo-400 transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => delStudent(s._id)}
                                title="Delete"
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {students.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-sm">
                  No students yet.
                </div>
              ) : (
                students.map((s) => (
                  <div
                    key={s._id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.email}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditStudent(s)}
                          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => delStudent(s._id)}
                          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-teal-900/50 text-teal-300 border border-teal-800 rounded-full px-2 py-0.5">
                        {s.branch} · {s.semester}
                      </span>
                      {s.rollNo && (
                        <span className="bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                          {s.rollNo}
                        </span>
                      )}
                      <span className="text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── ADD/EDIT TEACHER MODAL ── */}
      {(modal === "add" || modal === "edit-teacher") && (
        <Modal
          title={modal === "add" ? "Add New Teacher" : "Edit Teacher"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <input
              value={tForm.name}
              onChange={setT("name")}
              placeholder="Full Name *"
              className={inputCls}
            />
            <input
              value={tForm.username}
              onChange={setT("username")}
              placeholder="Username * (for login)"
              className={inputCls}
            />
            <input
              value={tForm.email}
              onChange={setT("email")}
              placeholder="Email"
              type="email"
              className={inputCls}
            />
            <input
              value={tForm.phone}
              onChange={setT("phone")}
              placeholder="Phone Number"
              className={inputCls}
            />
            {modal === "edit-teacher" && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Key size={11} /> Leave password blank to keep existing
                password. Use "Change Password" button to change it.
              </p>
            )}
            {modal === "add" && (
              <>
                <div className="relative">
                  <input
                    value={tForm.password}
                    onChange={setT("password")}
                    type={showPw ? "text" : "password"}
                    placeholder="Password *"
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={tForm.confirmPw}
                    onChange={setT("confirmPw")}
                    type={showConf ? "text" : "password"}
                    placeholder="Confirm Password *"
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {tForm.password &&
                  tForm.confirmPw &&
                  tForm.password !== tForm.confirmPw && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} /> Passwords don't match
                    </p>
                  )}
                {tForm.password &&
                  tForm.confirmPw &&
                  tForm.password === tForm.confirmPw && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Check size={11} /> Passwords match
                    </p>
                  )}
              </>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTeacher}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {modal === "add" ? "Create Teacher" : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {modal === "change-pw" && (
        <Modal
          title={`Change Password — ${selected?.name}`}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-lg px-3 py-2.5 text-xs text-gray-400 flex items-center gap-2">
              <Key size={13} className="text-yellow-400" /> Changing password
              for:{" "}
              <span className="font-semibold text-white">
                {selected?.username}
              </span>
            </div>
            <div className="relative">
              <input
                value={pwForm.password}
                onChange={setPw("password")}
                type={showPw ? "text" : "password"}
                placeholder="New Password *"
                className={inputCls + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="relative">
              <input
                value={pwForm.confirmPw}
                onChange={setPw("confirmPw")}
                type={showConf ? "text" : "password"}
                placeholder="Confirm New Password *"
                className={inputCls + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConf((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {pwForm.password &&
              pwForm.confirmPw &&
              pwForm.password !== pwForm.confirmPw && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} /> Passwords don't match
                </p>
              )}
            {pwForm.password &&
              pwForm.confirmPw &&
              pwForm.password === pwForm.confirmPw && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Check size={11} /> Passwords match
                </p>
              )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePassword}
                disabled={
                  saving ||
                  pwForm.password !== pwForm.confirmPw ||
                  !pwForm.password
                }
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Change Password
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── EDIT STUDENT MODAL ── */}
      {modal === "edit-student" && (
        <Modal
          title={`Edit Student — ${selected?.name}`}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <input
              value={sForm.name}
              onChange={setS("name")}
              placeholder="Full Name *"
              className={inputCls}
            />
            <input
              value={sForm.rollNo}
              onChange={setS("rollNo")}
              placeholder="Roll Number"
              className={inputCls}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sForm.branch}
                onChange={(e) => {
                  setS("branch")(e);
                  setSForm((f) => ({
                    ...f,
                    semester: SEMS[e.target.value]?.[0] || "",
                  }));
                }}
                className={inputCls}
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <select
                value={sForm.semester}
                onChange={setS("semester")}
                className={inputCls}
              >
                {(SEMS[sForm.branch] || []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStudent}
                disabled={saving}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />} Save
                Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
