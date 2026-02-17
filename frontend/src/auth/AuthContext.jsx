import { useEffect, useMemo, useState } from "react";
import { api, setOnUnauthorized } from "../api/client";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const isAuthed = !!token;

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setBooting(false);
      return;
    }

    setToken(stored);

    (async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    });
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const newToken = res.data?.token;

    if (!newToken) {
      throw new Error("Login response did not include token");
    }

    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      const me = await api.get("/me");
      setUser(me.data);
    } catch {
      // /me lookup failed, but login itself succeeded.
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthed, booting, login, logout }),
    [token, user, isAuthed, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
