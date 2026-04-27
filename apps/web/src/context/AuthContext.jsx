import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/apiClient.js";
import { clearStoredTokens, getStoredTokens, setStoredAccessToken, setStoredTokens } from "../lib/authStorage.js";

const AuthContext = createContext(null);

function extractErrorMessage(err) {
  const m = err?.response?.data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(err?.response?.data?.errors)) {
    return err.response.data.errors.map((e) => e.message || e.path).join(". ");
  }
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const loadSession = useCallback(async () => {
    setStatus("loading");
    const { accessToken, refreshToken } = getStoredTokens();
    if (!accessToken && !refreshToken) {
      setUser(null);
      setStatus("ready");
      return;
    }

    try {
      const me = await api.get("/auth/me");
      if (me.data?.user) {
        setUser(me.data.user);
        setStatus("ready");
        return;
      }
      if (refreshToken) {
        const { data: tok } = await api.post("/auth/refresh", { refreshToken });
        if (tok?.accessToken) {
          setStoredTokens(tok.accessToken, tok.refreshToken || refreshToken);
          const me2 = await api.get("/auth/me");
          setUser(me2.data?.user || null);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      if (refreshToken) {
        try {
          const { data: tok } = await api.post("/auth/refresh", { refreshToken });
          if (tok?.accessToken) {
            setStoredTokens(tok.accessToken, tok.refreshToken || refreshToken);
            setStoredAccessToken(tok.accessToken);
            const me3 = await api.get("/auth/me");
            setUser(me3.data?.user || null);
          } else {
            setUser(null);
            clearStoredTokens();
          }
        } catch {
          setUser(null);
          clearStoredTokens();
        }
      } else {
        setUser(null);
        clearStoredTokens();
      }
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async ({ emailOrPhone, password }) => {
    const { data } = await api.post("/auth/login", { emailOrPhone, password });
    if (data?.accessToken && data?.refreshToken) {
      setStoredTokens(data.accessToken, data.refreshToken);
    }
    let next = data?.user || null;
    if (!next) {
      const me = await api.get("/auth/me");
      next = me.data?.user || null;
    }
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async ({ name, email, phone, password, role }) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      phone,
      password,
      role: role || "renter",
    });
    if (data?.accessToken && data?.refreshToken) {
      setStoredTokens(data.accessToken, data.refreshToken);
    }
    let next = data?.user || null;
    if (!next) {
      const me = await api.get("/auth/me");
      next = me.data?.user || null;
    }
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken } = getStoredTokens();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      } else {
        await api.post("/auth/logout", {});
      }
    } catch {
      /* still clear */
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      loadSession,
      getError: extractErrorMessage,
    }),
    [user, status, login, register, logout, loadSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
