import React from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import StudentSection from "./pages/StudentSection";
import TeacherApp from "./TeacherApp";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#030712",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h2
              style={{
                color: "#f87171",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                marginBottom: "1.5rem",
              }}
            >
              {this.state.error.message}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("sps_token");
                window.location.reload();
              }}
              style={{
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.625rem 1.25rem",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Clear session &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030712",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid #4f46e5",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!user) return <LoginPage />;
  if (user.role === "admin") return <AdminPanel />;
  if (user.role === "student") return <StudentSection />;
  return <TeacherApp />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid #374151",
            },
          }}
        />
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}
