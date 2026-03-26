import React, { useState } from "react";
import { GraduationCap, Eye, EyeOff, Loader2, Shield, BookOpen, Users } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";

const BRANCHES = ["MCA","BCA","BSc_ITM"];
const SEMS = {
  MCA:["1st Sem","2nd Sem","3rd Sem","4th Sem"],
  BCA:["1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem"],
  BSc_ITM:["1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem"],
};

export default function LoginPage() {
  const { login } = useAuth();
  const [role,    setRole]    = useState("student");
  const [mode,    setMode]    = useState("login");
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({
    username:"", password:"", email:"", name:"", branch:"MCA", semester:"1st Sem", rollNo:""
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (role === "admin")
        res = await authAPI.adminLogin(form.username, form.password);
      else if (role === "teacher")
        res = await authAPI.teacherLogin(form.username, form.password);
      else if (mode === "register")
        res = await authAPI.studentRegister({ name:form.name, email:form.email, branch:form.branch, semester:form.semester, rollNo:form.rollNo });
      else
        res = await authAPI.studentLogin(form.email);

      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  }

  const roles = [
    { id:"admin",   label:"Admin",   icon:Shield,   grad:"from-red-700 to-red-800",       desc:"Full control" },
    { id:"teacher", label:"Teacher", icon:BookOpen, grad:"from-indigo-700 to-indigo-800",  desc:"Upload notes" },
    { id:"student", label:"Student", icon:Users,    grad:"from-teal-700 to-teal-800",      desc:"Access notes" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/60">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">School of Professional Studies</h1>
          <p className="text-gray-400 text-sm mt-1">AI-Powered Notes Management</p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {roles.map(r => (
            <button key={r.id} onClick={() => { setRole(r.id); setMode("login"); }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all
                ${role===r.id
                  ? `bg-gradient-to-b ${r.grad} border-transparent text-white shadow-lg`
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"}`}>
              <r.icon size={18} />
              <span className="text-xs font-semibold">{r.label}</span>
              <span className="text-xs opacity-70">{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-1">
            {role==="admin" ? "Admin Login"
            :role==="teacher" ? "Teacher Login"
            :mode==="register" ? "Create Student Account" : "Student Login"}
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            {role==="admin" ? "Enter your admin credentials"
            :role==="teacher" ? "Use credentials provided by admin"
            :mode==="register" ? "Create your account to access notes" : "Enter your email to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Student register extra */}
            {role==="student" && mode==="register" && <>
              <input value={form.name} onChange={set("name")} placeholder="Full Name *" required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500 transition-colors" />
              <input value={form.rollNo} onChange={set("rollNo")} placeholder="Roll Number (optional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500 transition-colors" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.branch}
                  onChange={e => { set("branch")(e); setForm(f => ({...f, semester: SEMS[e.target.value][0]})); }}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-teal-500">
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
                <select value={form.semester} onChange={set("semester")}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-teal-500">
                  {(SEMS[form.branch]||[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>}

            {/* Email for student */}
            {role==="student" && (
              <input value={form.email} onChange={set("email")} type="email" placeholder="Email address *" required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500 transition-colors" />
            )}

            {/* Username for admin/teacher */}
            {(role==="admin" || role==="teacher") && (
              <input value={form.username} onChange={set("username")} placeholder="Username *" required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors" />
            )}

            {/* Password for admin/teacher */}
            {(role==="admin" || role==="teacher") && (
              <div className="relative">
                <input value={form.password} onChange={set("password")} type={show?"text":"password"} placeholder="Password *" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors pr-10" />
                <button type="button" onClick={() => setShow(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            )}

            {/* Student note */}
            {role==="student" && mode==="login" && (
              <p className="text-xs text-gray-600 bg-gray-800 rounded-lg px-3 py-2">
                No password needed — just enter your registered email to access notes.
              </p>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 mt-1
                ${role==="admin" ? "bg-red-600 hover:bg-red-700"
                :role==="teacher" ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-teal-600 hover:bg-teal-700"} disabled:opacity-50`}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {role==="admin" ? "Login as Admin"
              :role==="teacher" ? "Login as Teacher"
              :mode==="register" ? "Create Account" : "Access Notes"}
            </button>
          </form>

          {role==="student" && (
            <p className="text-center text-xs text-gray-500 mt-4">
              {mode==="login" ? <>No account? <button onClick={() => setMode("register")} className="text-teal-400 hover:text-teal-300 underline">Register here</button></> 
              : <>Already registered? <button onClick={() => setMode("login")} className="text-teal-400 hover:text-teal-300 underline">Sign in</button></>}
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          School of Professional Studies · AI Notes VPS
        </p>
      </div>
    </div>
  );
}
