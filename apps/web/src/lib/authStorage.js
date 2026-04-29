const KEY_ACCESS = "gbtrip_access_token";
const KEY_REFRESH = "gbtrip_refresh_token";

export function getStoredTokens() {
  try {
    return {
      accessToken: localStorage.getItem(KEY_ACCESS) || null,
      refreshToken: localStorage.getItem(KEY_REFRESH) || null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export function setStoredTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(KEY_REFRESH, refreshToken);
}

export function setStoredAccessToken(accessToken) {
  if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
}

export function clearStoredTokens() {
  try {
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
  } catch {
    /* ignore */
  }
}
