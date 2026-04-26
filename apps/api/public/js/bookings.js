/**
 * Renter + owner booking lists (GET /api/v1/bookings/mine, PATCH to update)
 */
(function () {
  const API = "/api/v1/bookings";

  function getUser() {
    return window.GBAuth && typeof window.GBAuth.getUser === "function"
      ? window.GBAuth.getUser()
      : null;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatRange(startIso, endIso) {
    const a = new Date(startIso);
    const b = new Date(endIso);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "—";
    const o = { day: "numeric", month: "short", year: "numeric" };
    return `${a.toLocaleDateString("en-GB", o)} – ${b.toLocaleDateString("en-GB", o)}`;
  }

  function statusBadge(status) {
    const map = {
      requested: "⏳ Requested",
      accepted: "✓ Confirmed",
      rejected: "✗ Rejected",
      cancelled: "Cancelled",
      completed: "✓ Completed",
    };
    const cls =
      status === "requested"
        ? "badge-amber"
        : status === "accepted"
          ? "badge-amber"
          : status === "completed"
            ? "badge-green"
            : "badge";
    return `<span class="badge ${cls}">${escapeHtml(map[status] || status)}</span>`;
  }

  function carLine(b) {
    if (b.car && b.car.title) {
      const loc = b.car.location && b.car.location.district ? b.car.location.district : "";
      return `${escapeHtml(b.car.title)}${loc ? " — " + escapeHtml(loc) : ""}`;
    }
    return "Vehicle";
  }

  function carIcon(b) {
    if (b.car && b.car.image) {
      return `<div class="booking-car-icon" style="background-image:url('${String(b.car.image).replace(/'/g, "%27")}');background-size:cover;background-position:center"></div>`;
    }
    return '<div class="booking-car-icon">🚙</div>';
  }

  async function fetchMine() {
    if (!window.GBApi || typeof window.GBApi.apiJson !== "function") {
      throw new Error("App not ready");
    }
    return window.GBApi.apiJson(`${API}/mine`, { method: "GET" });
  }

  function renderRenterEmpty(mount) {
    mount.innerHTML = `<p class="text-sm text-muted" style="padding:1rem">No bookings yet. <a href="#" data-gb-page="listings" style="color:var(--amber)">Browse cars</a></p>`;
    mount.querySelector("[data-gb-page]")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.showPage) void window.showPage("listings");
    });
  }

  function bindOpenDetail(mount) {
    mount.querySelectorAll("[data-gb-open-car]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const id = el.getAttribute("data-gb-open-car");
        if (id && window.GBDetail && typeof window.GBDetail.setSelectedId === "function") {
          window.GBDetail.setSelectedId(id);
        }
        if (window.showPage) void window.showPage("detail");
        if (window.GBDetail && typeof window.GBDetail.load === "function") {
          void window.GBDetail.load();
        }
      });
    });
  }

  function renderRenterBookings(mount, bookings) {
    if (!bookings || bookings.length === 0) {
      renderRenterEmpty(mount);
      return;
    }
    const rows = bookings
      .map((b) => {
        const canCancel = b.status === "requested" || b.status === "accepted";
        const cur = b.currency || "PKR";
        const amt = b.quotedAmount != null ? Math.round(Number(b.quotedAmount)) : "—";
        return `
        <div class="booking-item" data-booking-id="${String(b.id)}">
          ${carIcon(b)}
          <div class="booking-info">
            <div class="booking-car-name">${carLine(b)}</div>
            <div class="booking-dates">${escapeHtml(formatRange(b.startDate, b.endDate))} · ${
          b.totalDays
        } day${b.totalDays === 1 ? "" : "s"}</div>
            <div class="mt-1">${statusBadge(b.status)}</div>
          </div>
          <div>
            <div class="booking-amount">${escapeHtml(cur)} ${typeof amt === "number" ? amt.toLocaleString("en-GB") : escapeHtml(String(amt))}</div>
            <div class="booking-amount-lbl">Quoted</div>
            ${
              b.car || b.carId
                ? `<button type="button" class="btn btn-outline btn-sm mt-1" data-gb-open-car="${escapeHtml(
                    String(b.car && b.car.id != null ? b.car.id : b.carId)
                  )}">Car details</button>`
                : ""
            }
            ${
              canCancel
                ? `<button type="button" class="btn btn-outline btn-sm mt-1" style="color:#c43c3c;border-color:#c43c3c" data-gb-cancel="${String(
                    b.id
                  )}">Cancel</button>`
                : ""
            }
          </div>
        </div>`;
      })
      .join("");
    mount.innerHTML = rows;
    bindOpenDetail(mount);
    mount.querySelectorAll("[data-gb-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-gb-cancel");
        if (!id || !window.GBApi) return;
        const reason = window.prompt("Cancellation reason (optional, min 3 characters):") || "Cancelled from dashboard";
        if (reason.length < 3) {
          window.alert("Please provide at least 3 characters for the reason.");
          return;
        }
        void window.GBApi
          .apiJson(`${API}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "cancelled", cancellationReason: reason }),
          })
          .then(() => loadRenter())
          .catch((e) => window.alert(e.message || String(e)));
      });
    });
  }

  function updateRenterStats(bookings) {
    const total = bookings.length;
    const active = bookings.filter((b) => b.status === "requested" || b.status === "accepted").length;
    const done = bookings.filter((b) => b.status === "completed").length;
    const spent = bookings
      .filter((b) => b.status === "completed" && b.quotedAmount != null)
      .reduce((s, b) => s + Number(b.quotedAmount), 0);
    const set = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = v;
    };
    set("renterStatTotal", String(total));
    set("renterStatActive", String(active));
    set("renterStatDone", String(done));
    if (document.getElementById("renterStatSpent")) {
      const k = Math.round(spent / 1000);
      document.getElementById("renterStatSpent").innerHTML =
        "PKR<br><span style=\"font-size:1.4rem\">" + (k > 0 ? k + "K" : "0") + "</span>";
    }
  }

  function updateRenterHeader() {
    const u = getUser();
    if (!u) return;
    const name = (u.name && String(u.name).split(" ")[0]) || "there";
    const w = document.getElementById("renterWelcome");
    if (w) w.textContent = `Hi, ${name} 👋`;
    const rd = document.getElementById("renterDate");
    if (rd) {
      rd.textContent = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    const a = document.getElementById("renterSidebarName");
    if (a) a.textContent = u.name || "Account";
    const av = document.getElementById("renterSidebarAvatar");
    if (av && u.name) {
      const p = u.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      av.textContent = p || "—";
    }
  }

  async function loadRenter() {
    const mount = document.getElementById("renterBookingsList");
    if (!mount) return;
    updateRenterHeader();
    mount.innerHTML = '<p class="text-sm text-muted">Loading…</p>';
    let data;
    try {
      data = await fetchMine();
    } catch (e) {
      mount.innerHTML = `<p class="text-sm" style="color:#c43c3c;padding:1rem">${escapeHtml(e.message || String(e))}</p>`;
      return;
    }
    const list = data.bookings || [];
    updateRenterStats(list);
    renderRenterBookings(mount, list);
  }

  function renderOwnerPending(mount, bookings) {
    const pending = (bookings || []).filter((b) => b.status === "requested");
    if (pending.length === 0) {
      mount.innerHTML = '<p class="text-sm text-muted">No pending requests.</p>';
      return;
    }
    mount.innerHTML = pending
      .map((b) => {
        const cur = b.currency || "PKR";
        const amt = b.quotedAmount != null ? Math.round(Number(b.quotedAmount)) : "—";
        return `
        <div class="booking-item" style="border-left:3px solid var(--amber)" data-booking-id="${String(b.id)}">
          ${carIcon(b)}
          <div class="booking-info">
            <div class="booking-car-name">${carLine(b)}</div>
            <div class="booking-dates">${escapeHtml(formatRange(b.startDate, b.endDate))} · ${
          b.totalDays
        } day(s)</div>
            <div class="mt-1 text-sm text-muted">Booking #${String(b.id).slice(-6)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;text-align:right">
            <div class="booking-amount">${escapeHtml(cur)} ${
          typeof amt === "number" ? amt.toLocaleString("en-GB") : escapeHtml(String(amt))
        }</div>
            <button type="button" class="btn btn-forest btn-sm" data-gb-accept="${String(b.id)}">✓ Accept</button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#c43c3c;border-color:#c43c3c" data-gb-reject="${String(
              b.id
            )}">✗ Decline</button>
          </div>
        </div>`;
      })
      .join("");

    mount.querySelectorAll("[data-gb-accept]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-gb-accept");
        if (!id) return;
        void window.GBApi
          .apiJson(`${API}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "accepted", note: "Accepted from dashboard" }),
          })
          .then(() => loadOwner())
          .catch((e) => window.alert(e.message || String(e)));
      });
    });
    mount.querySelectorAll("[data-gb-reject]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-gb-reject");
        if (!id) return;
        void window.GBApi
          .apiJson(`${API}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "rejected", note: "Declined from dashboard" }),
          })
          .then(() => loadOwner())
          .catch((e) => window.alert(e.message || String(e)));
      });
    });
  }

  function renderOwnerAll(mount, bookings) {
    const tb = mount.querySelector("tbody");
    if (!tb) return;
    if (!bookings || bookings.length === 0) {
      tb.innerHTML =
        '<tr><td colspan="6" class="text-sm text-muted">No bookings yet.</td></tr>';
      return;
    }
    const rows = bookings
      .map((b) => {
        const cur = b.currency || "PKR";
        const amt = b.quotedAmount != null ? Math.round(Number(b.quotedAmount)) : "—";
        return `<tr>
          <td>—</td>
          <td>${carLine(b)}</td>
          <td>${escapeHtml(formatRange(b.startDate, b.endDate))}</td>
          <td>${b.totalDays}</td>
          <td>${escapeHtml(cur)} ${typeof amt === "number" ? amt.toLocaleString("en-GB") : escapeHtml(String(amt))}</td>
          <td>${statusBadge(b.status)}</td>
        </tr>`;
      })
      .join("");
    tb.innerHTML = rows;
  }

  function updateOwnerStats(bookings) {
    const pending = (bookings || []).filter((b) => b.status === "requested").length;
    const set = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = v;
    };
    set("ownerStatPending", String(pending));
    const pb = document.getElementById("ownerPendingBadge");
    if (pb) pb.textContent = pending === 0 ? "0 awaiting" : `${pending} awaiting response`;
  }

  async function loadOwner() {
    const pendingMount = document.getElementById("ownerBookingsPending");
    const table = document.getElementById("ownerBookingsTable");
    if (pendingMount) pendingMount.innerHTML = '<p class="text-sm text-muted">Loading…</p>';
    if (table) {
      const tb = table.querySelector("tbody");
      if (tb) tb.innerHTML = "";
    }
    let data;
    try {
      data = await fetchMine();
    } catch (e) {
      if (pendingMount) {
        pendingMount.innerHTML = `<p class="text-sm" style="color:#c43c3c">${escapeHtml(e.message || String(e))}</p>`;
      }
      return;
    }
    const list = data.bookings || [];
    updateOwnerStats(list);
    if (pendingMount) renderOwnerPending(pendingMount, list);
    if (table) renderOwnerAll(table, list);
  }

  window.GBBookings = {
    loadRenter,
    loadOwner,
  };
})();
