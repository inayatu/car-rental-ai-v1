export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:4000/api/v1";

export function getApiOrigin() {
  if (import.meta.env?.VITE_API_ORIGIN) {
    return String(import.meta.env.VITE_API_ORIGIN).replace(/\/$/, "");
  }
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "http://localhost:4000";
  }
}

/** Resolves a relative /uploads/... path to an absolute URL. */
export function resolveAssetUrl(path) {
  if (!path || typeof path !== "string") return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${getApiOrigin()}${path.startsWith("/") ? "" : "/"}${path}`;
}
