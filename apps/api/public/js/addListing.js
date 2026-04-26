/**
 * Owner: create vehicle — POST /api/v1/cars (multipart)
 */
(function () {
  const API = "/api/v1/cars";

  function el(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    const e = el("addListingError");
    const s = el("addListingSuccess");
    if (s) {
      s.style.display = "none";
      s.textContent = "";
    }
    if (e) {
      e.textContent = msg || "";
      e.style.display = msg ? "block" : "none";
    }
  }

  function showSuccess(msg) {
    const e = el("addListingError");
    const s = el("addListingSuccess");
    if (e) {
      e.style.display = "none";
      e.textContent = "";
    }
    if (s) {
      s.textContent = msg || "";
      s.style.display = msg ? "block" : "none";
    }
  }

  function buildDescription() {
    const base = (el("addListingDescription") && el("addListingDescription").value.trim()) || "";
    const vt = (el("addListingVehicleType") && el("addListingVehicleType").value) || "";
    const prefix = vt ? `Vehicle type: ${vt}\n\n` : "";
    const out = (prefix + base).trim();
    return out || undefined;
  }

  function appendIf(fd, key, value) {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    fd.append(key, value);
  }

  async function submitCar(status) {
    showError("");
    showSuccess("");

    const title = el("addListingTitle") && el("addListingTitle").value.trim();
    const brand = el("addListingBrand") && el("addListingBrand").value.trim();
    const model = el("addListingModel") && el("addListingModel").value.trim();
    const year = el("addListingYear") && el("addListingYear").value;
    const reg = el("addListingReg") && el("addListingReg").value.trim();
    const district = el("addListingDistrict") && el("addListingDistrict").value.trim();
    const price = el("addListingPrice") && el("addListingPrice").value;

    if (!title || !brand || !model || !year || !reg || !district || !price) {
      showError("Please fill in all required fields.");
      return;
    }

    const imageInput = el("addListingImages");
    const images = imageInput && imageInput.files ? imageInput.files : null;
    if (!images || images.length === 0) {
      showError("Please add at least one vehicle photo (JPEG, PNG, or WebP).");
      return;
    }
    if (images.length > 10) {
      showError("Maximum 10 photos.");
      return;
    }

    const rc = el("addListingDocRc") && el("addListingDocRc").files && el("addListingDocRc").files[0];
    if (!rc) {
      showError("Vehicle registration (RC) PDF is required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("brand", brand);
    fd.append("model", model);
    fd.append("year", String(parseInt(year, 10)));
    fd.append("registrationNumber", reg);
    fd.append("district", district);
    fd.append("basePricePerDay", String(Number(price)));
    fd.append("status", status);

    const currency = el("addListingCurrency") && el("addListingCurrency").value.trim();
    fd.append("currency", currency || "PKR");

    const seats = el("addListingSeats") && el("addListingSeats").value;
    if (seats !== "" && seats != null) {
      fd.append("seats", String(parseInt(seats, 10)));
    }

    appendIf(fd, "color", el("addListingColor") && el("addListingColor").value.trim());

    const trans = el("addListingTransmission") && el("addListingTransmission").value;
    if (trans) fd.append("transmission", trans);

    const fuel = el("addListingFuel") && el("addListingFuel").value;
    if (fuel) fd.append("fuelType", fuel);

    const city = el("addListingCity") && el("addListingCity").value.trim();
    appendIf(fd, "city", city);

    const desc = buildDescription();
    appendIf(fd, "description", desc);

    for (let i = 0; i < images.length; i += 1) {
      fd.append("images", images[i]);
    }

    const docTypes = [];
    fd.append("documents", rc);
    docTypes.push("vehicle_registration");

    const cnic = el("addListingDocCnic") && el("addListingDocCnic").files && el("addListingDocCnic").files[0];
    if (cnic) {
      fd.append("documents", cnic);
      docTypes.push("owner_cnic");
    }
    const fitness = el("addListingDocFitness") && el("addListingDocFitness").files && el("addListingDocFitness").files[0];
    if (fitness) {
      fd.append("documents", fitness);
      docTypes.push("fitness_certificate");
    }
    const ins = el("addListingDocInsurance") && el("addListingDocInsurance").files && el("addListingDocInsurance").files[0];
    if (ins) {
      fd.append("documents", ins);
      docTypes.push("insurance");
    }

    fd.append("documentTypes", JSON.stringify(docTypes));

    const btnA = el("addListingSubmitActive");
    const btnD = el("addListingSubmitDraft");
    if (btnA) btnA.disabled = true;
    if (btnD) btnD.disabled = true;

    try {
      const res = await fetch(API, {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = data.message || `Request failed (${res.status})`;
        if (Array.isArray(data.errors) && data.errors[0]) {
          const i = data.errors[0];
          if (i && (i.path || i.message)) {
            const p = i.path && i.path.length ? i.path.join(".") + ": " : "";
            msg = p + (i.message || msg);
          }
        }
        if (res.status === 403) {
          msg = "Only owner accounts can list vehicles. Log in with an owner account.";
        }
        showError(msg);
        return;
      }
      showSuccess(
        status === "draft"
          ? "Draft saved. You can submit it from your dashboard when ready."
          : "Vehicle submitted for verification. Our team will review it within 24–72 hours."
      );
      const form = el("form-add-listing");
      if (form) form.reset();
      if (el("addListingCurrency")) el("addListingCurrency").value = "PKR";
      if (window.showPage) {
        window.setTimeout(() => {
          void window.showPage("owner-dashboard");
        }, 1800);
      }
    } catch (err) {
      showError(err.message || String(err));
    } finally {
      if (btnA) btnA.disabled = false;
      if (btnD) btnD.disabled = false;
    }
  }

  function bind() {
    const form = el("form-add-listing");
    if (!form || form._gbAddListingBound) return;
    form._gbAddListingBound = true;
    const a = el("addListingSubmitActive");
    const d = el("addListingSubmitDraft");
    if (a) {
      a.addEventListener("click", () => {
        void submitCar("active");
      });
    }
    if (d) {
      d.addEventListener("click", () => {
        void submitCar("draft");
      });
    }
  }

  function onShow() {
    const y = el("addListingYear");
    if (y) {
      const maxY = new Date().getFullYear() + 1;
      y.setAttribute("max", String(maxY));
    }
    showError("");
    showSuccess("");
  }

  window.GBAddListing = {
    bind,
    onShow,
  };
})();
