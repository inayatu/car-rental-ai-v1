import axios from "axios";
import { clearStoredTokens, getStoredTokens, setStoredAccessToken, setStoredTokens } from "./authStorage.js";
import { API_BASE } from "./resolveApiUrl.js";

let refreshInFlight = null;

function createRefreshClient() {
  return axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
}

async function runRefreshFlow() {
  const { refreshToken } = getStoredTokens();
  const c = createRefreshClient();
  const payload = refreshToken ? { refreshToken } : {};
  const r = await c.post("/auth/refresh", payload);
  const d = r.data || {};
  if (!d.accessToken) {
    throw new Error("Refresh response missing access token");
  }
  if (d.refreshToken) {
    setStoredTokens(d.accessToken, d.refreshToken);
  } else {
    setStoredAccessToken(d.accessToken);
  }
  return d;
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredTokens();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.data != null && typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const res = err.response;
    const original = err.config;
    if (!res || res.status !== 401 || !original) {
      return Promise.reject(err);
    }
    if (original.__didRefresh) {
      return Promise.reject(err);
    }
    const u = String(original.url || "");
    if (u.includes("/auth/refresh") || u.includes("/auth/login") || u.includes("/auth/register")) {
      return Promise.reject(err);
    }

    try {
      if (!refreshInFlight) {
        refreshInFlight = runRefreshFlow()
          .finally(() => {
            refreshInFlight = null;
          });
      }
      await refreshInFlight;
      const { accessToken: next } = getStoredTokens();
      if (!next) {
        clearStoredTokens();
        return Promise.reject(err);
      }
      original.__didRefresh = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${next}`;

      // Multipart bodies are often not replayable after the first failed attempt (e.g. 401 → refresh → retry).
      // Rebuild FormData from file entries so the retry includes both files.
      if (typeof FormData !== "undefined" && original.data instanceof FormData) {
        const rebuilt = new FormData();
        try {
          for (const [key, value] of original.data.entries()) {
            rebuilt.append(key, value);
          }
        } catch {
          return Promise.reject(err);
        }
        original.data = rebuilt;
        if (typeof original.headers.delete === "function") {
          original.headers.delete("Content-Type");
        } else {
          delete original.headers["Content-Type"];
        }
      }

      return api.request(original);
    } catch (e) {
      clearStoredTokens();
      return Promise.reject(e);
    }
  }
);
