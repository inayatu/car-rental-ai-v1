/**
 * Public car detail + renter booking request
 */
(function () {
  const API = "/api/v1/cars";
  const BOOKINGS = "/api/v1/bookings";

  let selectedId = null;

  function getUser() {
    return window.GBAuth && typeof window.GBAuth.getUser === "function"
      ? window.GBAuth.getUser()
      : null;
  }

  function setSelectedId(id) {
    selectedId = id;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fuelLabel(f) {
    if (!f) return "—";
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  function dateToIsoStart(dateStr) {
    if (!dateStr) return "";
    return `${dateStr}T00:00:00.000Z`;
  }

  function dateToIsoEndExclusive(dateStr) {
    if (!dateStr) return "";
    return `${dateStr}T00:00:00.000Z`;
  }

  function dayDiff(a, b) {
    const d1 = new Date(a);
    const d2 = new Date(b);
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime()) || d2 <= d1) return 0;
    return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setGallery(imgs) {
    const g = el("detailGallery");
    const thumbRow = el("detailThumbs");
    if (!g) return;
    const list = Array.isArray(imgs) ? imgs.filter(Boolean).slice(0, 5) : [];
    g.style.backgroundSize = "cover";
    g.style.backgroundPosition = "center";
    if (list[0]) {
      g.style.backgroundImage = `url('${String(list[0]).replace(/'/g, "%27")}')`;
      g.textContent = "";
    } else {
      g.style.backgroundImage = "none";
      g.textContent = g.textContent.trim() ? g.textContent : "🚙";
    }
    if (thumbRow) {
      thumbRow.innerHTML = "";
      if (list.length <= 1) {
        thumbRow.style.display = "none";
      } else {
        thumbRow.style.display = "flex";
        const go = (u) => {
          if (g) {
            g.style.backgroundImage = `url('${String(u).replace(/'/g, "%27")}')`;
            g.textContent = "";
          }
        };
        list.forEach((u) => {
          const b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Show photo");
          b.style.width = "64px";
          b.style.height = "64px";
          b.style.borderRadius = "8px";
          b.style.border = "2px solid var(--border)";
          b.style.padding = "0";
          b.style.cursor = "pointer";
          b.style.backgroundSize = "cover";
          b.style.backgroundPosition = "center";
          b.style.backgroundImage = `url('${String(u).replace(/'/g, "%27")}')`;
          b.addEventListener("click", () => {
            go(u);
            thumbRow.querySelectorAll("button").forEach((x) => {
              x.style.borderColor = "var(--border)";
            });
            b.style.borderColor = "var(--moss, #2d5a3d)";
          });
          thumbRow.appendChild(b);
        });
        const firstBtn = thumbRow.querySelector("button");
        if (firstBtn) firstBtn.style.borderColor = "var(--moss, #2d5a3d)";
      }
    }
  }

  function getCurrentCar() {
    return window.GBDetail && window.GBDetail._currentCar;
  }

  function updateEstimate() {
    const car = getCurrentCar();
    const start = el("detailBookStart");
    const end = el("detailBookEnd");
    const row = el("detailBookBreakdown");
    if (!row || !car) return;
    const s = start && start.value;
    const e = end && end.value;
    const days = s && e ? dayDiff(dateToIsoStart(s), dateToIsoEndExclusive(e)) : 0;
    const base = car.basePricePerDay != null ? Number(car.basePricePerDay) : 0;
    const cur = car.currency || "PKR";
    const subtotal = days > 0 ? Math.round(base * days) : 0;
    row.innerHTML = `
      <div class="booking-row"><span>${cur} ${Math.round(base)} × ${days} day${days === 1 ? "" : "s"}</span><span>${
        days > 0 ? `${cur} ${subtotal.toLocaleString("en-GB")}` : "—"
      }</span></div>
      <div class="booking-row total"><span>Estimated total</span><span>${
        days > 0 ? `${cur} ${subtotal.toLocaleString("en-GB")}` : "—"
      }</span></div>
    `;
  }

  function wireCalc(car) {
    window.GBDetail._currentCar = car;
    const onChange = () => updateEstimate();
    const start = el("detailBookStart");
    const end = el("detailBookEnd");
    if (start) {
      start.oninput = onChange;
      start.onchange = onChange;
    }
    if (end) {
      end.oninput = onChange;
      end.onchange = onChange;
    }
    onChange();
  }

  async function load() {
    const errBox = el("detailError");
    const main = el("detailContent");
    const loading = el("detailLoading");
    if (errBox) {
      errBox.style.display = "none";
      errBox.textContent = "";
    }
    if (loading) loading.style.display = "block";
    if (main) main.style.opacity = "0.5";
    if (!window.GBApi || typeof window.GBApi.apiJson !== "function") {
      if (loading) loading.style.display = "none";
      if (errBox) {
        errBox.textContent = "App not ready.";
        errBox.style.display = "block";
      }
      return;
    }
    const id = selectedId;
    if (!id) {
      if (loading) loading.style.display = "none";
      if (errBox) {
        errBox.textContent = "No vehicle selected. Browse listings and pick a car.";
        errBox.style.display = "block";
      }
      if (main) main.style.opacity = "1";
      window.GBDetail._currentCar = null;
      return;
    }
    let data;
    try {
      data = await window.GBApi.apiJson(`${API}/public/${encodeURIComponent(id)}`, { method: "GET" });
    } catch (e) {
      if (loading) loading.style.display = "none";
      if (errBox) {
        errBox.textContent = e.message || String(e);
        errBox.style.display = "block";
      }
      if (main) main.style.opacity = "1";
      return;
    }
    if (loading) loading.style.display = "none";
    if (main) main.style.opacity = "1";
    const car = data.car;
    if (!car) return;

    const title = [car.title, [car.brand, car.model].filter(Boolean).join(" ")].find(Boolean) || "Vehicle";
    const tEl = el("detailTitle");
    if (tEl) tEl.textContent = title;
    const loc = el("detailLoc");
    if (loc) {
      const d = car.location && car.location.district;
      const c = car.location && car.location.city;
      loc.textContent = d ? `📍 ${d}${c ? `, ${c}` : ""} · Gilgit Baltistan` : "📍 Gilgit Baltistan";
    }
    setGallery(car.images);
    const specFuel = el("detailSpecFuel");
    if (specFuel) specFuel.textContent = fuelLabel(car.fuelType);
    const specSeats = el("detailSpecSeats");
    if (specSeats) specSeats.textContent = car.seats != null ? `${car.seats} Seats` : "—";
    const specTrans = el("detailSpecTrans");
    if (specTrans) specTrans.textContent = car.transmission === "automatic" ? "Automatic" : "Manual";
    const specYear = el("detailSpecYear");
    if (specYear) specYear.textContent = car.year != null ? String(car.year) : "—";
    const desc = el("detailDescription");
    if (desc) desc.textContent = car.description || "No description provided.";
    const owner = el("detailOwnerName");
    if (owner) owner.textContent = car.ownerName || "Verified owner";
    const oa = el("detailOwnerAvatar");
    if (oa) {
      const n = car.ownerName || "";
      oa.textContent = n
        ? n
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "—";
    }
    const price = el("detailPrice");
    if (price) {
      const p = car.basePricePerDay != null ? Math.round(car.basePricePerDay) : "—";
      const cur = car.currency || "PKR";
      price.innerHTML = `${escapeHtml(String(cur))} ${escapeHtml(String(p))} <span>/ day</span>`;
    }
    const msg = el("detailBookMsg");
    if (msg) {
      msg.style.display = "none";
      msg.textContent = "";
      msg.style.color = "";
    }
    wireCalc(car);
    const uP = getUser();
    if (uP) {
      const rn = el("detailRenterName");
      const rp = el("detailRenterPhone");
      const re = el("detailRenterEmail");
      if (rn && !rn.value) rn.value = uP.name || "";
      if (rp && !rp.value) rp.value = uP.phone || "";
      if (re && !re.value) re.value = uP.email || "";
    }
    const form = el("detailBookForm");
    if (form) {
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        if (msg) {
          msg.style.display = "none";
          msg.textContent = "";
        }
        const carData = getCurrentCar();
        if (!carData) return;
        const user = getUser();
        if (!user) {
          if (window.__openAuth) window.__openAuth("signup");
          return;
        }
        if (user.role !== "renter") {
          if (msg) {
            msg.textContent =
              "Only renter accounts can book vehicles. Sign up or log in with a renter account.";
            msg.style.display = "block";
          }
          return;
        }
        const st = el("detailBookStart");
        const en = el("detailBookEnd");
        const sVal = st && st.value;
        const eVal = en && en.value;
        if (!sVal || !eVal) {
          if (msg) {
            msg.textContent = "Please choose pick-up and return dates.";
            msg.style.display = "block";
          }
          return;
        }
        if (eVal <= sVal) {
          if (msg) {
            msg.textContent = "Return date must be after pick-up date.";
            msg.style.display = "block";
          }
          return;
        }
        const startIso = dateToIsoStart(sVal);
        const endIso = dateToIsoEndExclusive(eVal);
        if (!dayDiff(startIso, endIso)) {
          if (msg) {
            msg.textContent = "Booking must span at least one day.";
            msg.style.display = "block";
          }
          return;
        }
        const rName = (el("detailRenterName") && el("detailRenterName").value && el("detailRenterName").value.trim()) || "";
        const rPhone = (el("detailRenterPhone") && el("detailRenterPhone").value && el("detailRenterPhone").value.trim()) || "";
        const rEmail = (el("detailRenterEmail") && el("detailRenterEmail").value && el("detailRenterEmail").value.trim()) || "";
        const nRaw = el("detailNumberOfPersons") && el("detailNumberOfPersons").value;
        const nPersons = Math.min(50, Math.max(1, parseInt(String(nRaw), 10) || 1));
        if (!rName || !rPhone || !rEmail) {
          if (msg) {
            msg.textContent = "Please enter your name, phone, and email.";
            msg.style.color = "#c43c3c";
            msg.style.display = "block";
          }
          return;
        }
        const rNotes = el("detailRenterNotes") && el("detailRenterNotes").value && el("detailRenterNotes").value.trim();
        const btn = el("detailBookBtn");
        if (btn) btn.disabled = true;
        try {
          const payload = {
            carId: String(carData.id),
            startDate: startIso,
            endDate: endIso,
            renterName: rName,
            numberOfPersons: nPersons,
            renterPhone: rPhone,
            renterEmail: rEmail,
          };
          if (rNotes) payload.notes = rNotes;
          await window.GBApi.apiJson(BOOKINGS, {
            method: "POST",
            body: JSON.stringify(payload),
          });
          if (msg) {
            msg.textContent = "Booking requested. The owner will respond soon.";
            msg.style.color = "var(--moss, #2d5a3d)";
            msg.style.display = "block";
          }
          if (window.showPage) void window.showPage("renter-dashboard");
        } catch (e) {
          if (msg) {
            msg.textContent = e.message || String(e);
            msg.style.color = "#c43c3c";
            msg.style.display = "block";
          }
        } finally {
          if (btn) btn.disabled = false;
        }
      };
    }
  }

  window.GBDetail = {
    load,
    setSelectedId,
    getSelectedId() {
      return selectedId;
    },
    _currentCar: null,
  };
})();
