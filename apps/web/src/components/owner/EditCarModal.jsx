import { useEffect, useMemo, useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { CAR_BRANDS, CAR_COLORS, defaultModelForBrand, getModelsForBrand } from "../../lib/vehicleOptions.js";
import { labelForVehicleType, VEHICLE_TYPES } from "../../lib/vehicleTypes.js";
import { CAR_TITLE_MAX_LENGTH, truncateCarTitle } from "../../lib/carTitleLimits.js";

const panel = {
  background: "var(--white)",
  borderRadius: "var(--r-lg)",
  border: "1px solid var(--border)",
  width: "min(92vw, 760px)",
  maxHeight: "86vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-lg)",
};

function toInitialForm(car) {
  const brand = car?.brand || CAR_BRANDS[0];
  return {
    title: car?.title || "",
    brand,
    model: car?.model || defaultModelForBrand(brand),
    year: String(car?.year || ""),
    registrationNumber: car?.registrationNumber || "",
    color: car?.color || "",
    seats: car?.seats != null ? String(car.seats) : "",
    transmission: car?.transmission || "manual",
    fuelType: car?.fuelType || "diesel",
    vehicleType: car?.vehicleType || "suv_4wd",
    basePricePerDay: car?.basePricePerDay != null ? String(car.basePricePerDay) : "",
    currency: car?.currency || "PKR",
    district: car?.location?.district || "",
    city: car?.location?.city || "",
    status: car?.status || "active",
    description: car?.description || "",
  };
}

const readOnlyGrid = {
  display: "grid",
  gap: "0.65rem",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
};

function ReadOnlyField({ label, value }) {
  const text = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: "var(--ink4)" }}>{label}</div>
      <div style={{ marginTop: 3, color: "var(--ink2)", lineHeight: 1.35 }}>{text}</div>
    </div>
  );
}

export function EditCarModal({ car, saving = false, error = null, onClose, onSave }) {
  const isBlacklisted = car?.verification?.status === "blacklisted";
  const isVerifiedListing = car?.verification?.status === "verified";
  const [form, setForm] = useState(() => toInitialForm(car));
  const modelOptions = useMemo(() => getModelsForBrand(form.brand), [form.brand]);

  useEffect(() => {
    setForm(toInitialForm(car));
  }, [car]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose, saving]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onBrandChange = (value) => {
    const options = getModelsForBrand(value);
    setForm((prev) => {
      const keepModel = options.includes(prev.model);
      return {
        ...prev,
        brand: value,
        model: keepModel ? prev.model : defaultModelForBrand(value),
      };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (isBlacklisted) return;
    if (isVerifiedListing) {
      onSave({
        basePricePerDay: Number(form.basePricePerDay),
        currency: (form.currency || "PKR").trim().toUpperCase(),
        district: form.district.trim(),
        status: form.status,
      });
      return;
    }
    const payload = {
      title: truncateCarTitle(form.title.trim()),
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      registrationNumber: form.registrationNumber.trim(),
      color: form.color || undefined,
      seats: form.seats === "" ? undefined : Number(form.seats),
      transmission: form.transmission,
      fuelType: form.fuelType,
      vehicleType: form.vehicleType,
      basePricePerDay: Number(form.basePricePerDay),
      currency: (form.currency || "PKR").trim().toUpperCase(),
      district: form.district.trim(),
      city: form.city.trim() || undefined,
      status: form.status,
      description: form.description.trim() || undefined,
    };
    onSave(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit car listing"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(13,27,42,0.56)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div style={panel}>
        <form onSubmit={submit}>
          <div
            style={{
              padding: "1rem 1rem 0.85rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700 }}>
                Edit listing
              </h3>
              <p style={{ margin: "0.3rem 0 0", fontSize: 12, color: "var(--ink4)" }}>
                {isVerifiedListing
                  ? "Verified listing: adjust price, district, or listing status."
                  : "Update your vehicle details and save changes."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close edit modal"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 22,
                lineHeight: 1,
                cursor: saving ? "not-allowed" : "pointer",
                color: "var(--ink3)",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "1rem", display: "grid", gap: "0.9rem" }}>
            {error ? <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>{error}</p> : null}
            {isBlacklisted ? (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "#991b1b",
                  background: "rgba(239, 68, 68, 0.09)",
                  border: "1px solid rgba(220, 38, 38, 0.28)",
                }}
              >
                This listing is blacklisted by moderators. Saving changes is disabled until staff removes the blacklist.
              </div>
            ) : null}

            {isVerifiedListing && !isBlacklisted ? (
              <div
                role="status"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--ink2)",
                  background: "rgba(37, 99, 235, 0.08)",
                  border: "1px solid rgba(37, 99, 235, 0.22)",
                }}
              >
                This listing is verified. Vehicle identity and photos are locked. You can change the daily price,
                district, and whether the listing is active, paused, or draft.
              </div>
            ) : null}

            <div
              style={
                isBlacklisted
                  ? { opacity: 0.68, pointerEvents: "none", userSelect: "none" }
                  : undefined
              }
              aria-disabled={isBlacklisted ? true : undefined}
            >
              {isVerifiedListing ? (
                <>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface-muted, rgba(15, 23, 42, 0.03))",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "var(--ink4)", marginBottom: 10 }}>
                      VEHICLE DETAILS (READ ONLY)
                    </div>
                    <div style={readOnlyGrid}>
                      <ReadOnlyField label="Title" value={car?.title} />
                      <ReadOnlyField label="Registration" value={car?.registrationNumber} />
                      <ReadOnlyField label="Brand / model" value={`${car?.brand || ""} ${car?.model || ""}`.trim()} />
                      <ReadOnlyField label="Year" value={car?.year} />
                      <ReadOnlyField label="Seats" value={car?.seats} />
                      <ReadOnlyField label="Vehicle type" value={labelForVehicleType(car?.vehicleType)} />
                      <ReadOnlyField label="Fuel" value={car?.fuelType} />
                      <ReadOnlyField label="Transmission" value={car?.transmission} />
                      <ReadOnlyField label="Color" value={car?.color} />
                      <ReadOnlyField label="City" value={car?.location?.city} />
                    </div>
                    {car?.description ? (
                      <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                        Description
                        <div
                          style={{
                            marginTop: 6,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--white)",
                            fontWeight: 400,
                            color: "var(--ink2)",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.45,
                          }}
                        >
                          {car.description}
                        </div>
                      </label>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: "0.25rem" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Price per day
                      <input required type="number" min="0" step="100" value={form.basePricePerDay} onChange={(e) => setField("basePricePerDay", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Currency
                      <input maxLength={3} value={form.currency} onChange={(e) => setField("currency", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      District
                      <input required value={form.district} onChange={(e) => setField("district", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Listing status
                      <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="draft">Draft</option>
                      </select>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Title
                      <input
                        required
                        value={form.title}
                        maxLength={CAR_TITLE_MAX_LENGTH}
                        onChange={(e) => setField("title", e.target.value.slice(0, CAR_TITLE_MAX_LENGTH))}
                      />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Registration number
                      <input required value={form.registrationNumber} onChange={(e) => setField("registrationNumber", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Brand
                      <select value={form.brand} onChange={(e) => onBrandChange(e.target.value)}>
                        {CAR_BRANDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Model
                      <select value={form.model} onChange={(e) => setField("model", e.target.value)}>
                        {modelOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Year
                      <input required type="number" min="1980" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setField("year", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Seats
                      <input type="number" min="1" max="12" value={form.seats} onChange={(e) => setField("seats", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Price per day
                      <input required type="number" min="0" step="100" value={form.basePricePerDay} onChange={(e) => setField("basePricePerDay", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Currency
                      <input maxLength={3} value={form.currency} onChange={(e) => setField("currency", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Vehicle type
                      <select value={form.vehicleType} onChange={(e) => setField("vehicleType", e.target.value)}>
                        {VEHICLE_TYPES.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Fuel
                      <select value={form.fuelType} onChange={(e) => setField("fuelType", e.target.value)}>
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Transmission
                      <select value={form.transmission} onChange={(e) => setField("transmission", e.target.value)}>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Status
                      <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="draft">Draft</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      District
                      <input required value={form.district} onChange={(e) => setField("district", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      City
                      <input value={form.city} onChange={(e) => setField("city", e.target.value)} />
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                      Color
                      <select value={form.color} onChange={(e) => setField("color", e.target.value)}>
                        <option value="">Not specified</option>
                        {CAR_COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                    Description
                    <textarea rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} />
                  </label>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "0.9rem 1rem 1rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <Btn variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="primary" type="submit" disabled={saving || isBlacklisted}>
              {saving ? "Saving..." : "Save changes"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
