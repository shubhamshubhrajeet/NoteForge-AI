import React, { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("sps_token");
      if (token) {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            setUser({
              id: payload.id || "",
              name: payload.name || "User",
              role: payload.role || "student",
              branch: payload.branch || "",
              semester: payload.semester || "",
              username: payload.username || "",
            });
          } else {
            // Token expired — clear it
            localStorage.removeItem("sps_token");
          }
        } else {
          localStorage.removeItem("sps_token");
        }
      }
    } catch (err) {
      // Any error — clear bad token and show login
      console.warn("Auth token error:", err.message);
      localStorage.removeItem("sps_token");
    } finally {
      setLoading(false);
    }
  }, []);

  function login(token, userData) {
    try {
      localStorage.setItem("sps_token", token);
      setUser(userData);
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  function logout() {
    localStorage.removeItem("sps_token");
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
