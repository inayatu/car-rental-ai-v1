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

    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      clearStoredTokens();
      return Promise.reject(err);
    }

    try {
      if (!refreshInFlight) {
        const c = createRefreshClient();
        refreshInFlight = c
          .post("/auth/refresh", { refreshToken })
          .then((r) => {
            const d = r.data;
            if (d?.accessToken && d?.refreshToken) {
              setStoredTokens(d.accessToken, d.refreshToken);
            } else if (d?.accessToken) {
              setStoredAccessToken(d.accessToken);
            }
            return d;
          })
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
      return api.request(original);
    } catch (e) {
      clearStoredTokens();
      return Promise.reject(e);
    }
  }
);
