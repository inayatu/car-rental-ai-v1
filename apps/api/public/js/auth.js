/**
 * Auth state + API (cookies: accessToken, refreshToken are httpOnly — use /api/v1/auth/me to read session)
 */
(function () {
  const API = "/api/v1/auth";

  const PROTECTED_PAGES = {
    "renter-dashboard": ["renter", "owner", "admin", "govt_staff"],
    "owner-dashboard": ["owner", "admin", "govt_staff"],
    "add-listing": ["owner", "admin", "govt_staff"],
  };

  let sessionUser = null;

  function getUser() {
    return sessionUser;
  }

  async function fetchSession() {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    sessionUser = data.user || null;
    renderAuthChrome();
    return sessionUser;
  }

  function postLoginPage(user) {
    if (["owner", "admin", "govt_staff"].includes(user.role)) {
      return "owner-dashboard";
    }
    return "renter-dashboard";
  }

  /**
   * Opens login/signup only for guests. Logged-in users are redirected in ensurePageAccess.
   */
  async function openAuthView(tab) {
    if (!window.showPage) {
      return;
    }
    await window.showPage("auth");
    const authPage = document.getElementById("page-auth");
    if (!authPage || !authPage.classList.contains("active")) {
      return;
    }
    const tabEls = document.querySelectorAll("#page-auth .auth-tab");
    if (tab === "signup" && tabEls[1] && window.switchAuthTab) {
      window.switchAuthTab(tabEls[1], "signup");
    } else if (tabEls[0] && window.switchAuthTab) {
      window.switchAuthTab(tabEls[0], "login");
    }
  }

  function renderAuthChrome() {
    const navSlot = document.getElementById("navAuthSlot");
    const drawerSlot = document.getElementById("drawerAuthSlot");
    if (!navSlot) return;

    if (!sessionUser) {
      navSlot.innerHTML = `
        <button type="button" class="btn btn-outline-white btn-sm" data-gb-nav="auth">Login</button>
        <button type="button" class="btn btn-amber btn-sm" data-gb-nav="auth-signup">Sign Up Free</button>
      `;
      if (drawerSlot) {
        drawerSlot.innerHTML = '<a data-gb-nav="auth">Login / Sign Up</a>';
      }
    } else {
      const who =
        (sessionUser.name && String(sessionUser.name).split(" ")[0]) || "Account";
      navSlot.innerHTML = `
        <span class="text-sm" style="color:rgba(255,255,255,0.8);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeAttr(
          sessionUser.email || ""
        )}">${escapeHtml(who)}</span>
        <button type="button" class="btn btn-outline-white btn-sm" data-gb-nav="renter">My Bookings</button>
        ${
          ["owner", "admin", "govt_staff"].includes(sessionUser.role)
            ? '<button type="button" class="btn btn-outline-white btn-sm" data-gb-nav="owner">Owner</button>'
            : ""
        }
        <button type="button" class="btn btn-amber btn-sm" data-gb-logout>Logout</button>
      `;
      if (drawerSlot) {
        drawerSlot.innerHTML = `
          <a data-gb-nav="renter">My Bookings</a>
          ${
            ["owner", "admin", "govt_staff"].includes(sessionUser.role)
              ? '<a data-gb-nav="owner">Owner Portal</a>'
              : ""
          }
          <a data-gb-logout>Logout</a>
        `;
      }
    }

    navSlot.querySelectorAll("[data-gb-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const n = el.getAttribute("data-gb-nav");
        if (n === "auth" || n === "auth-signup") {
          void openAuthView(n === "auth-signup" ? "signup" : "login");
        } else if (n === "renter") {
          if (window.showPage) void window.showPage("renter-dashboard");
        } else if (n === "owner") {
          if (window.showPage) void window.showPage("owner-dashboard");
        } else if (n === "listings") {
          if (window.showPage) void window.showPage("listings");
        }
      });
    });
    navSlot.querySelectorAll("[data-gb-logout]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    });
    if (drawerSlot) {
      drawerSlot.querySelectorAll("[data-gb-nav]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          if (window.closeDrawer) window.closeDrawer();
          const n = el.getAttribute("data-gb-nav");
          if (n === "auth") {
            void openAuthView("login");
          } else if (n === "listings") {
            if (window.showPage) void window.showPage("listings");
          } else if (n === "renter") {
            if (window.showPage) void window.showPage("renter-dashboard");
          } else if (n === "owner") {
            if (window.showPage) void window.showPage("owner-dashboard");
          }
        });
      });
      drawerSlot.querySelectorAll("[data-gb-logout]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          if (window.closeDrawer) window.closeDrawer();
          logout();
        });
      });
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function showAuthError(msg) {
    const el = document.getElementById("authError");
    if (el) {
      el.textContent = msg || "";
      el.style.display = msg ? "block" : "none";
    } else {
      if (msg) {
        // eslint-disable-next-line no-alert
        alert(msg);
      }
    }
  }

  function mapSignupRole(value) {
    if (value === "owner" || value === "renter") {
      return value;
    }
    if (value === "both") {
      return "owner";
    }
    return "renter";
  }

  async function register(payload) {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    sessionUser = data.user;
    renderAuthChrome();
    return data;
  }

  async function login(payload) {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    sessionUser = data.user;
    renderAuthChrome();
    return data;
  }

  async function logout() {
    await fetch(`${API}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    }).catch(() => {});
    sessionUser = null;
    renderAuthChrome();
    if (window.showPage) {
      window.showPage("home");
    }
  }

  /**
   * Logged-in users are sent to their dashboard; login/signup is not shown.
   */
  async function ensurePageAccess(name) {
    if (name === "auth") {
      if (!sessionUser) {
        await fetchSession();
      }
      if (sessionUser) {
        if (window.applyPage) {
          window.applyPage(postLoginPage(sessionUser));
        }
        return false;
      }
      return true;
    }

    const allowedRoles = PROTECTED_PAGES[name];
    if (!allowedRoles) {
      return true;
    }
    if (!sessionUser) {
      await fetchSession();
    }
    if (!sessionUser) {
      if (typeof window.__openAuth === "function") {
        window.__openAuth("login");
      } else {
        if (window.applyPage) {
          window.applyPage("auth");
        } else if (window.showPage) {
          window.showPage("auth");
        }
      }
      return false;
    }
    if (!allowedRoles.includes(sessionUser.role)) {
      /* eslint-disable no-alert */
      alert("You do not have access to that page for your account type.");
      return false;
    }
    return true;
  }

  function bindAuthForms() {
    const loginForm = document.getElementById("form-login");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showAuthError("");
        const emailOrPhone = document.getElementById("loginEmailOrPhone");
        const password = document.getElementById("loginPassword");
        try {
          await login({
            emailOrPhone: (emailOrPhone && emailOrPhone.value) || "",
            password: (password && password.value) || "",
          });
          if (window.showPage) {
            window.showPage(postLoginPage(sessionUser));
          }
        } catch (err) {
          showAuthError(err.message || "Login failed");
        }
      });
    }

    const signupForm = document.getElementById("form-signup");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showAuthError("");
        const first = document.getElementById("signupFirstName");
        const last = document.getElementById("signupLastName");
        const phone = document.getElementById("signupPhone");
        const email = document.getElementById("signupEmail");
        const roleEl = document.getElementById("signupRole");
        const password = document.getElementById("signupPassword");
        const name = [first && first.value, last && last.value].filter(Boolean).join(" ").trim() || "User";
        try {
          await register({
            name,
            phone: (phone && phone.value) || "",
            email: (email && email.value) || "",
            password: (password && password.value) || "",
            role: mapSignupRole((roleEl && roleEl.value) || "renter"),
          });
          if (window.showPage) {
            window.showPage(postLoginPage(sessionUser));
          }
        } catch (err) {
          showAuthError(err.message || "Sign up failed");
        }
      });
    }
  }

  function init() {
    bindAuthForms();
    return fetchSession().then(() => {
      const authPage = document.getElementById("page-auth");
      if (sessionUser && authPage && authPage.classList.contains("active") && window.applyPage) {
        window.applyPage(postLoginPage(sessionUser));
      }
    });
  }

  window.GBAuth = {
    init,
    fetchSession,
    getUser,
    ensurePageAccess,
    openAuthView,
    postLoginPage,
    mapSignupRole,
    showAuthError,
    renderAuthChrome,
    get PROTECTED_PAGES() {
      return { ...PROTECTED_PAGES };
    },
  };
})();
