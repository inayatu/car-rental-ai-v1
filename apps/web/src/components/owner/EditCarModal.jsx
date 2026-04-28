import { useEffect, useMemo, useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { CAR_BRANDS, CAR_COLORS, defaultModelForBrand, getModelsForBrand } from "../../lib/vehicleOptions.js";
import { VEHICLE_TYPES } from "../../lib/vehicleTypes.js";

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

export function EditCarModal({ car, saving = false, error = null, onClose, onSave }) {
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
    const payload = {
      title: form.title.trim(),
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
                Update your vehicle details and save changes.
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

            <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>
                Title
                <input required value={form.title} onChange={(e) => setField("title", e.target.value)} />
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
            <Btn variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
