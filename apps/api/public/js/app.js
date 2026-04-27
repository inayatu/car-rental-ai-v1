function loadPartials() {
  return Promise.all([
    fetch("/partials/drawer.html")
      .then((r) => r.text())
      .then((h) => {
        const el = document.getElementById("include-nav-drawer");
        if (el) el.innerHTML = h;
      }),
    fetch("/partials/nav.html")
      .then((r) => r.text())
      .then((h) => {
        const el = document.getElementById("include-global-nav");
        if (el) el.innerHTML = h;
      }),
    fetch("/partials/home-footer.html")
      .then((r) => r.text())
      .then((h) => {
        const el = document.getElementById("include-home-footer");
        if (el) el.innerHTML = h;
      }),
  ]);
}

// ── Owner my bookings: tab (matches apps/web /dashboard/owner/bookings?tab=…) ──
window.__ownerBookingsTab = "pending";

/**
 * @param {string} t pending | upcoming | active | completed | declined
 */
function syncOwnerBookingsTabBar() {
  var t = window.__ownerBookingsTab || "pending";
  var bar = document.getElementById("ownerBookingTabBar");
  if (bar) {
    bar.querySelectorAll("[data-owner-btab]").forEach(function (btn) {
      var on = btn.getAttribute("data-owner-btab") === t;
      btn.style.outline = on ? "2px solid var(--amber, #c9a44e)" : "none";
      btn.style.fontWeight = on ? "700" : "500";
    });
  }
}

/**
 * @param {string} t
 */
function setOwnerBookingsTab(t) {
  const allow = new Set(["pending", "upcoming", "active", "completed", "declined"]);
  window.__ownerBookingsTab = allow.has(t) ? t : "pending";
  syncOwnerBookingsTabBar();
  if (window.GBBookings && typeof window.GBBookings.loadOwner === "function") {
    void window.GBBookings.loadOwner();
  }
}
window.setOwnerBookingsTab = setOwnerBookingsTab;
window.syncOwnerBookingsTabBar = syncOwnerBookingsTabBar;

// ── PAGE ROUTING (applyPage = no auth check; showPage = guarded) ──
function applyPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const target = document.getElementById("page-" + name);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0);
  }
}
window.applyPage = applyPage;

async function showPage(name) {
  if (window.GBAuth && typeof window.GBAuth.ensurePageAccess === "function") {
    if (!(await window.GBAuth.ensurePageAccess(name))) {
      return;
    }
  }
  applyPage(name);
  if (name === "listings" && window.GBListings && typeof window.GBListings.load === "function") {
    void window.GBListings.load();
  }
  if (name === "detail" && window.GBDetail && typeof window.GBDetail.load === "function") {
    void window.GBDetail.load();
  }
  if (name === "renter-dashboard" && window.GBBookings && typeof window.GBBookings.loadRenter === "function") {
    void window.GBBookings.loadRenter();
  }
  if (name === "owner-dashboard" && window.GBBookings && typeof window.GBBookings.loadOwner === "function") {
    void window.GBBookings.loadOwner();
  }
  if (name === "owner-bookings" && window.GBBookings && typeof window.GBBookings.loadOwner === "function") {
    if (window.syncOwnerBookingsTabBar) window.syncOwnerBookingsTabBar();
    void window.GBBookings.loadOwner();
  }
  if (name === "add-listing" && window.GBAddListing) {
    if (typeof window.GBAddListing.bind === "function") {
      window.GBAddListing.bind();
    }
    if (typeof window.GBAddListing.onShow === "function") {
      window.GBAddListing.onShow();
    }
  }
}

window.__openAuth = function (tab) {
  if (window.GBAuth && typeof window.GBAuth.openAuthView === "function") {
    return window.GBAuth.openAuthView(tab === "signup" ? "signup" : "login");
  }
  void showPage("auth");
};

// ── MOBILE DRAWER ──
function openDrawer() {
  const d = document.getElementById("navDrawer");
  if (d) d.classList.add("open");
}
function closeDrawer() {
  const d = document.getElementById("navDrawer");
  if (d) d.classList.remove("open");
}

// ── FILTER TOGGLE (mobile) ──
function toggleFilter() {
  const sidebar = document.getElementById("filterSidebar");
  const closeBtn = document.getElementById("filterCloseBtn");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  if (closeBtn) {
    closeBtn.style.display = sidebar.classList.contains("open") ? "block" : "none";
  }
}

// ── AUTH TABS (also bound via bindAuthTabs — inline onclick is brittle with CSP) ──
function switchAuthTab(el, tab) {
  if (!el || (tab !== "login" && tab !== "signup")) {
    return;
  }
  const root = document.getElementById("page-auth");
  if (root) {
    root.querySelectorAll(".auth-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
  }
  el.classList.add("active");
  el.setAttribute("aria-selected", "true");
  const login = document.getElementById("auth-login");
  const signup = document.getElementById("auth-signup");
  if (login) {
    login.style.display = tab === "login" ? "block" : "none";
  }
  if (signup) {
    signup.style.display = tab === "signup" ? "block" : "none";
  }
}

function bindAuthTabs() {
  const page = document.getElementById("page-auth");
  if (!page) return;
  page.querySelectorAll(".auth-tabs .auth-tab").forEach((tabEl) => {
    tabEl.addEventListener("click", (e) => {
      e.preventDefault();
      const t = tabEl.getAttribute("data-auth-tab");
      if (t === "login" || t === "signup") {
        switchAuthTab(tabEl, t);
      }
    });
    tabEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tabEl.click();
      }
    });
  });
}

// ── PRICE CALC PLACEHOLDER ──
function calcPrice() {
  // In production: calculate from date difference × rate
}

function initDestTicker() {
  const s = document.getElementById("destScroll");
  if (s) s.innerHTML += s.innerHTML;
}

window.showPage = showPage;
window.switchAuthTab = switchAuthTab;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.toggleFilter = toggleFilter;
window.calcPrice = calcPrice;

document.addEventListener("DOMContentLoaded", () => {
  bindAuthTabs();
  loadPartials()
    .then(() => {
      initDestTicker();
      if (window.GBAuth && typeof window.GBAuth.init === "function") {
        return window.GBAuth.init();
      }
      return null;
    })
    .catch((e) => console.error(e));
});
