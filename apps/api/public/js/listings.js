/**
 * Public car list: GET /api/v1/cars with filters + pagination
 */
(function () {
  const API = "/api/v1/cars";

  let state = {
    page: 1,
    q: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    district: undefined,
    fuelType: undefined,
    transmission: undefined,
    sort: "newest",
  };

  function getVal(id) {
    const el = document.getElementById(id);
    return el && el.value !== undefined ? String(el.value).trim() : "";
  }
  function getInt(id) {
    const v = getVal(id);
    if (v === "") return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }

  function readStateFromForm() {
    const q = getVal("listingsSearch");
    const minP = getInt("listingsMinPrice");
    let maxP = getInt("listingsMaxPrice");
    if (maxP == null) {
      const range = document.getElementById("listingsMaxPriceRange");
      if (range && range.value) {
        const r = parseInt(range.value, 10);
        if (!Number.isNaN(r)) {
          maxP = r;
        }
      }
    }
    const district = getVal("listingsDistrict");
    const fuel = getVal("listingsFuel");
    const trans = getVal("listingsTrans");
    const sort = getVal("listingsSort") || "newest";
    return {
      page: 1,
      q: q || undefined,
      minPrice: minP,
      maxPrice: maxP,
      district: district || undefined,
      fuelType: fuel || undefined,
      transmission: trans || undefined,
      sort: ["newest", "price_asc", "price_desc"].includes(sort) ? sort : "newest",
    };
  }

  function buildQuery(params) {
    const sp = new URLSearchParams();
    sp.set("page", String(params.page));
    sp.set("limit", "12");
    if (params.q) sp.set("q", params.q);
    if (params.minPrice != null) sp.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) sp.set("maxPrice", String(params.maxPrice));
    if (params.district) sp.set("district", params.district);
    if (params.fuelType) sp.set("fuelType", params.fuelType);
    if (params.transmission) sp.set("transmission", params.transmission);
    if (params.sort) sp.set("sort", params.sort);
    return sp.toString();
  }

  function eventTargetElement(target) {
    if (!target) return null;
    return target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
  }

  function fuelLabel(f) {
    if (!f) return "";
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  function carCardHtml(c) {
    const price = c.basePricePerDay != null ? Math.round(c.basePricePerDay) : "—";
    const cur = c.currency || "PKR";
    const loc = c.location && c.location.district ? c.location.district : "—";
    const owner = c.ownerName || "Owner";
    const title = c.title || `${c.brand || ""} ${c.model || ""}`.trim() || "Vehicle";
    const img = Array.isArray(c.images) && c.images[0] ? c.images[0] : null;
    const rawId = c.id != null ? c.id : c._id;
    const id = rawId != null ? String(rawId) : "";
    const bg = img
      ? ` style="background-image:url('${String(img).replace(/'/g, "%27")}');background-size:cover;background-position:center;"`
      : "";
    return `
      <div class="car-card" data-car-id="${id}" role="button" tabindex="0">
        <div class="car-img"${bg}>${img ? "" : "🚙"}
          <div class="car-img-overlay">
            <span class="car-price-badge">${cur} ${price}/day</span>
            <span class="badge badge-green">Available</span>
          </div>
        </div>
        <div class="car-body">
          <div class="car-name">${escapeHtml(title)}</div>
          <div class="car-loc">📍 ${escapeHtml(loc)} · ${escapeHtml(owner)}</div>
          <div class="car-specs">
            <span class="car-spec">⛽ ${escapeHtml(fuelLabel(c.fuelType))}</span>
            <span class="car-spec">👥 ${c.seats != null ? c.seats : "—"} Seats</span>
            <span class="car-spec">${c.transmission === "automatic" ? "Auto" : "Manual"}</span>
          </div>
        </div>
        <div class="car-footer">
          <div class="car-rate">${cur} ${price} <span>/day</span></div>
          <button type="button" class="btn btn-amber btn-sm" data-gb-listing-cta>View & Book</button>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderPagination(page, totalPages) {
    const wrap = document.getElementById("listingsPagination");
    if (!wrap) return;
    if (totalPages <= 1) {
      wrap.innerHTML = "";
      return;
    }
    wrap.innerHTML = [
      `<button type="button" class="btn btn-outline btn-sm" ${
        page <= 1 ? "disabled" : ""
      } data-listings-page="${page - 1}">← Prev</button>`,
      `<span class="text-sm" style="padding:0 0.75rem">Page ${page} / ${totalPages}</span>`,
      `<button type="button" class="btn btn-outline btn-sm" ${
        page >= totalPages ? "disabled" : ""
      } data-listings-page="${page + 1}">Next →</button>`,
    ].join(" ");
    wrap.querySelectorAll("[data-listings-page]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (btn.disabled) return;
        const p = parseInt(btn.getAttribute("data-listings-page"), 10);
        if (Number.isNaN(p) || p < 1) return;
        void load({ ...state, page: p });
      });
    });
  }

  async function load(overrides) {
    if (overrides) {
      state = { ...state, ...overrides };
    }
    const grid = document.getElementById("listingsGrid");
    const loading = document.getElementById("listingsLoading");
    const empty = document.getElementById("listingsEmpty");
    if (loading) loading.style.display = "block";
    if (empty) empty.style.display = "none";
    if (grid) {
      grid.querySelectorAll(".car-card").forEach((n) => n.remove());
      const err = grid.querySelector(".listings-api-error");
      if (err) err.remove();
    }

    const qs = buildQuery(state);
    let data;
    try {
      const res = await fetch(`${API}?${qs}`, { credentials: "same-origin" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (${res.status})`);
      }
      data = await res.json();
    } catch (e) {
      if (grid) {
        grid.insertAdjacentHTML(
          "afterbegin",
          `<div class="listings-api-error" style="grid-column:1/-1;padding:1rem;background:rgba(200,60,60,0.1);border-radius:8px;color:#a33">Could not load cars: ${escapeHtml(
            e.message || String(e)
          )}</div>`
        );
      }
    } finally {
      if (loading) loading.style.display = "none";
    }

    if (!data) return;

    const countEl = document.getElementById("listingsCount");
    if (countEl) {
      countEl.innerHTML = `<strong>${data.total}</strong> vehicle${data.total === 1 ? "" : "s"} found`;
    }
    const sub = document.getElementById("listingsHeroSub");
    if (sub) {
      sub.textContent =
        data.total > 0
          ? `Page ${data.page} of ${data.totalPages || 1} · Verified, active vehicles`
          : "No listings match your filters. Try broadening your search.";
    }

    if (grid) {
      if (data.cars && data.cars.length > 0) {
        if (empty) empty.style.display = "none";
        const html = data.cars.map(carCardHtml).join("");
        const anchor = document.getElementById("listingsEmpty");
        if (anchor) {
          anchor.insertAdjacentHTML("beforebegin", html);
        } else {
          grid.insertAdjacentHTML("beforeend", html);
        }
      } else {
        if (empty) empty.style.display = "block";
      }
    }

    renderPagination(data.page, data.totalPages);
  }

  function bind() {
    const apply = document.getElementById("listingsApply");
    if (apply) {
      apply.addEventListener("click", (e) => {
        e.preventDefault();
        const next = readStateFromForm();
        state = { ...state, ...next };
        void load();
      });
    }
    const clear = document.getElementById("listingsClear");
    if (clear) {
      clear.addEventListener("click", (e) => {
        e.preventDefault();
        [
          "listingsSearch",
          "listingsDistrict",
          "listingsMinPrice",
          "listingsMaxPrice",
          "listingsFuel",
          "listingsTrans",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
        const sort = document.getElementById("listingsSort");
        if (sort) sort.value = "newest";
        const range = document.getElementById("listingsMaxPriceRange");
        if (range) {
          range.value = "25000";
          const v = document.getElementById("listingsMaxPrice");
          if (v) v.value = "";
          const show = document.getElementById("listingsMaxPriceVal");
          if (show) show.textContent = range.value;
        }
        state = {
          page: 1,
          q: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          district: undefined,
          fuelType: undefined,
          transmission: undefined,
          sort: "newest",
        };
        void load();
      });
    }
    const sort = document.getElementById("listingsSort");
    if (sort) {
      sort.addEventListener("change", () => {
        const s = getVal("listingsSort");
        if (s) {
          state.sort = ["newest", "price_asc", "price_desc"].includes(s) ? s : "newest";
          state.page = 1;
          void load();
        }
      });
    }
    const range = document.getElementById("listingsMaxPriceRange");
    if (range) {
      const sync = () => {
        const v = document.getElementById("listingsMaxPrice");
        if (v) v.value = range.value;
        const show = document.getElementById("listingsMaxPriceVal");
        if (show) {
          const n = parseInt(range.value, 10);
          show.textContent = Number.isNaN(n) ? range.value : n.toLocaleString("en-GB");
        }
      };
      range.addEventListener("input", sync);
      sync();
    }
  }

  function openDetailForCard(card) {
    const id = card && card.getAttribute("data-car-id");
    if (!id || id === "undefined" || id === "null") {
      return;
    }
    if (window.GBDetail && typeof window.GBDetail.setSelectedId === "function") {
      window.GBDetail.setSelectedId(id);
    }
    if (window.showPage) {
      void window.showPage("detail");
    }
  }

  function bindGridOpenDetail() {
    const grid = document.getElementById("listingsGrid");
    if (!grid || grid._gbOpenDetail) return;
    grid._gbOpenDetail = true;
    grid.addEventListener("click", (e) => {
      const from = eventTargetElement(e.target);
      if (!from || !from.closest) return;
      if (from.closest("a[href]")) return;
      const card = from.closest(".car-card[data-car-id]");
      if (!card) return;
      e.preventDefault();
      openDetailForCard(card);
    });
    grid.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const from = eventTargetElement(e.target);
      if (!from || !from.closest) return;
      const card = from.closest(".car-card[data-car-id]");
      if (!card || from !== card) return;
      e.preventDefault();
      openDetailForCard(card);
    });
  }

  let didBind = false;
  function bindOnce() {
    if (didBind) return;
    didBind = true;
    bind();
    bindGridOpenDetail();
  }

  window.GBListings = {
    load(over) {
      bindOnce();
      return load(over);
    },
    bind: bindOnce,
    getState() {
      return { ...state };
    },
  };
})();
