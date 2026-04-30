import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormGroup } from "../components/ui/FormGroup.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/apiClient.js";
import { PATH } from "../lib/paths.js";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import {
  CAR_BRANDS,
  CAR_COLORS,
  defaultBrand,
  defaultModelForBrand,
  getModelsForBrand,
} from "../lib/vehicleOptions.js";
import { VEHICLE_TYPES, defaultVehicleType } from "../lib/vehicleTypes.js";
import { CAR_TITLE_MAX_LENGTH, truncateCarTitle } from "../lib/carTitleLimits.js";

const DISTRICTS = [
  "Hunza",
  "Gilgit",
  "Skardu",
  "Ghizer",
  "Ghanche",
  "Astore",
  "Diamer",
  "Nagar",
  "Shigar",
  "Kharmang",
  "Other",
];

const DOC_SLOTS = [
  { key: "reg", docType: "vehicle_registration", label: "Vehicle registration (RC) — required", required: true },
  { key: "cnic", docType: "owner_cnic", label: "Owner CNIC (PDF)" },
  { key: "fitness", docType: "fitness_certificate", label: "Fitness certificate (PDF)" },
  { key: "insurance", docType: "insurance", label: "Insurance (PDF, optional)" },
];

export function PageAddListing() {
  const navigate = useNavigate();
  const { getError } = useAuth();
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(() => defaultModelForBrand(defaultBrand));
  const [year, setYear] = useState(new Date().getFullYear());
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [color, setColor] = useState("");
  const [seats, setSeats] = useState(5);
  const [transmission, setTransmission] = useState("manual");
  const [fuelType, setFuelType] = useState("petrol");
  const [vehicleType, setVehicleType] = useState(defaultVehicleType);
  const [basePricePerDay, setBasePricePerDay] = useState("");
  const [district, setDistrict] = useState("Hunza");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [docFiles, setDocFiles] = useState(() =>
    Object.fromEntries(DOC_SLOTS.map((s) => [s.key, null]))
  );
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const setDocFile = (key, file) => {
    setDocFiles((prev) => ({ ...prev, [key]: file || null }));
  };

  const onImagesChange = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(list.slice(0, 5));
  };

  const buildFormData = (status) => {
    const t = title.trim() || `${brand.trim()} ${model.trim()} ${year}`.trim();
    const body = {
      title: t,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      registrationNumber: registrationNumber.trim(),
      color: color.trim() || undefined,
      seats: Number(seats) || undefined,
      transmission,
      fuelType,
      vehicleType,
      basePricePerDay: Number(basePricePerDay),
      currency: "PKR",
      location: JSON.stringify({ district: district.trim(), city: city.trim() || undefined }),
      description: description.trim() || undefined,
      status,
    };

    const form = new FormData();
    Object.entries(body).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      form.append(k, String(v));
    });

    imageFiles.forEach((file) => form.append("images", file));

    const documentTypes = [];
    const docList = [];
    for (const slot of DOC_SLOTS) {
      const f = docFiles[slot.key];
      if (f) {
        docList.push(f);
        documentTypes.push(slot.docType);
      }
    }
    docList.forEach((f) => form.append("documents", f));
    if (documentTypes.length) {
      form.append("documentTypes", JSON.stringify(documentTypes));
    }

    return form;
  };

  const validate = (requireFull) => {
    if (!brand.trim() || !model.trim()) return "Brand and model are required.";
    if (!registrationNumber.trim() || registrationNumber.trim().length < 3) return "Registration number is required (min 3 characters).";
    const y = Number(year);
    if (Number.isNaN(y) || y < 1980 || y > new Date().getFullYear() + 1) return "Enter a valid year.";
    const price = Number(basePricePerDay);
    if (Number.isNaN(price) || price < 0) return "Enter a valid price per day.";
    if (!district.trim()) return "Select a district.";
    if (!Object.values(docFiles).some(Boolean)) {
      return "Add at least one PDF document (required by the server).";
    }
    if (!requireFull) return null;
    if (!docFiles.reg) return "Upload vehicle registration (PDF) for a full submission.";
    if (imageFiles.length < 1) return "Add at least one vehicle photo (JPEG, PNG, or WebP).";
    return null;
  };

  const submit = async (e, status) => {
    e?.preventDefault?.();
    setFormError(null);
    setSuccess(null);
    const v = validate(status === "active");
    if (v) {
      setFormError(v);
      return;
    }

    setBusy(true);
    try {
      const form = buildFormData(status);
      const { data } = await api.post("/cars", form);
      setSuccess(
        status === "draft"
          ? "Draft saved. You can finish the listing from your dashboard later."
          : `Vehicle submitted. Reference: ${data?.car?.id || "ok"}. It will appear in search after admin verification.`
      );
      setTimeout(() => navigate(PATH.ownerDashboard), 2000);
    } catch (err) {
      setFormError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={shellDashboard}>
      <Sidebar role="owner" />
      <main style={mainDashboard}>
        <Btn variant="outline" size="sm" onClick={() => navigate(PATH.ownerDashboard)} style={{ marginBottom: "1.5rem" }}>
          ← Back to Dashboard
        </Btn>
        <Eyebrow>Owner Portal</Eyebrow>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            marginBottom: "0.5rem",
            lineHeight: 1.2,
          }}
        >
          List your vehicle
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink3)",
            marginBottom: "1.5rem",
            maxWidth: "70ch",
            lineHeight: 1.55,
            wordBreak: "break-word",
          }}
        >
          Creates a listing via <code>POST /cars</code> (multipart). At least one PDF document is required; images are stored and attached to the listing.
        </p>

        {formError && <Alert type="error">{formError}</Alert>}
        {success && <Alert type="info">{success}</Alert>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(e, "active");
          }}
        >
          <div className="gb-add-listing-grid">
            <div className="gb-add-listing-form" style={{ minWidth: 0 }}>
              <Card style={{ padding: "clamp(1rem, 4vw, 1.8rem)", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", margin: "0 0 1rem" }}>Vehicle</h2>
                <div className="gb-form-2">
                  <FormGroup label={`Listing title (optional, max ${CAR_TITLE_MAX_LENGTH} characters)`}>
                    <input
                      value={title}
                      maxLength={CAR_TITLE_MAX_LENGTH}
                      onChange={(e) => setTitle(e.target.value.slice(0, CAR_TITLE_MAX_LENGTH))}
                      placeholder={`${brand || "Toyota"} ${model || "Prado"} ${year || ""}`.trim()}
                    />
                  </FormGroup>
                  <FormGroup label="Brand *">
                    <select
                      value={brand}
                      required
                      onChange={(e) => {
                        const b = e.target.value;
                        setBrand(b);
                        const models = getModelsForBrand(b);
                        setModel((prev) => (models.includes(prev) ? prev : models[0]));
                      }}
                    >
                      {CAR_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Model *">
                    <select value={model} required onChange={(e) => setModel(e.target.value)}>
                      {getModelsForBrand(brand).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Year *">
                    <input type="number" value={year} onChange={(e) => setYear(e.target.valueAsNumber || e.target.value)} min={1980} max={new Date().getFullYear() + 1} required />
                  </FormGroup>
                  <FormGroup label="Registration no. *">
                    <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required minLength={3} placeholder="GB-1234" />
                  </FormGroup>
                  <FormGroup label="Color">
                    <select value={color} onChange={(e) => setColor(e.target.value)}>
                      <option value="">Not specified</option>
                      {CAR_COLORS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Seats">
                    <input type="number" value={seats} onChange={(e) => setSeats(e.target.valueAsNumber)} min={1} max={12} />
                  </FormGroup>
                  <FormGroup label="Transmission *">
                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="Fuel *">
                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="Vehicle type *">
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required>
                      {VEHICLE_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
                <FormGroup label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Condition, features, off-road ability…"
                  />
                </FormGroup>
              </Card>

              <Card style={{ padding: "clamp(1rem, 4vw, 1.8rem)", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", margin: "0 0 1rem" }}>Location &amp; price</h2>
                <div className="gb-form-2">
                  <FormGroup label="District *">
                    <select value={district} onChange={(e) => setDistrict(e.target.value)} required>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="City / area">
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Aliabad, etc." />
                  </FormGroup>
                  <FormGroup label="Price per day (PKR) *">
                    <input
                      type="number"
                      value={basePricePerDay}
                      onChange={(e) => setBasePricePerDay(e.target.value)}
                      required
                      min={0}
                      step="100"
                      placeholder="8000"
                    />
                  </FormGroup>
                </div>
              </Card>

              <Card style={{ padding: "clamp(1rem, 4vw, 1.8rem)", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", margin: "0 0 0.5rem" }}>Photos</h2>
                <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: "0.8rem" }}>JPEG, PNG, or WebP. Up to 5 photos; renters can browse all on the vehicle page. Required for full submission.</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={onImagesChange}
                  style={{ maxWidth: "100%", minWidth: 0 }}
                />
                {imageFiles.length > 0 && (
                  <p style={{ fontSize: 12, marginTop: 8, color: "var(--ink2)" }}>
                    {imageFiles.length} file(s) selected
                  </p>
                )}
              </Card>

              <Card style={{ padding: "clamp(1rem, 4vw, 1.8rem)", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", margin: "0 0 0.5rem" }}>Documents (PDF)</h2>
                <Alert type="warn" style={{ marginBottom: "1rem" }}>
                  At least one PDF is required (registration). Other slots are optional. The API pairs each file with a document type.
                </Alert>
                {DOC_SLOTS.map((slot) => (
                  <FormGroup key={slot.key} label={`${slot.label}${slot.required ? " *" : ""}`}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setDocFile(slot.key, e.target.files?.[0] || null)}
                      style={{ maxWidth: "100%", minWidth: 0 }}
                    />
                  </FormGroup>
                ))}
              </Card>

              <div className="gb-add-listing-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Btn type="submit" variant="gold" size="lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit for verification →"}
                </Btn>
                <Btn
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={busy}
                  onClick={(e) => submit(e, "draft")}
                >
                  Save as draft
                </Btn>
              </div>
            </div>

            <div className="gb-add-listing-aside" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Card style={{ padding: "clamp(1rem, 3vw, 1.4rem)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: "0.8rem" }}>Checklist</div>
                <ul style={{ fontSize: 12, color: "var(--ink3)", lineHeight: 1.6, margin: 0, paddingLeft: "1.1rem" }}>
                  <li>Public search only shows <strong>active + verified</strong> cars</li>
                  <li>After submit, status is <strong>pending</strong> until a moderator approves</li>
                  <li>Registration number must be unique to your account</li>
                </ul>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
