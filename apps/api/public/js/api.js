/**
 * Shared API helpers (cookies / same-origin for auth)
 */
(function () {
  async function readBody(res) {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  async function apiJson(path, options) {
    const opts = options || {};
    const headers = { ...(opts.headers || {}) };
    if (opts.body && typeof opts.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(path, {
      credentials: "same-origin",
      ...opts,
      headers,
    });
    const data = await readBody(res);
    if (!res.ok) {
      const err = new Error(data.message || res.statusText || `Request failed (${res.status})`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  window.GBApi = { apiJson };
})();
