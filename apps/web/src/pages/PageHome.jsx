import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/layout/Footer.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { FormGroup } from "../components/ui/FormGroup.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { CarCard } from "../components/cars/CarCard.jsx";
import { Stars } from "../components/ui/Stars.jsx";
import { api } from "../lib/apiClient.js";
import { mapApiCarToDisplay } from "../lib/carMappers.js";
import { PATH } from "../lib/paths.js";
import { BRAND } from "../lib/brand.js";
import { HeroTypingHeadline } from "../components/home/HeroTypingHeadline.jsx";

const tickerText = [
  "Hunza Valley",
  "Skardu",
  "Fairy Meadows",
  "Deosai Plains",
  "K2 Base Camp",
  "Naltar Valley",
  "Shigar",
  "Passu",
  "Khaplu",
  "Babusar Top",
  "Naran",
  "Gilgit City",
];

export function PageHome() {
  const navigate = useNavigate();
  const [dest, setDest] = useState("Hunza Valley");
  const [pickDate, setPickDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [vType, setVType] = useState("any");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/cars", { params: { limit: 3, sort: "newest" } });
        if (cancel) return;
        setFeatured((data?.cars || []).map((c) => mapApiCarToDisplay(c)).filter(Boolean));
      } catch {
        if (!cancel) setFeatured([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div>
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "var(--slate)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(13,27,42,0.97) 0%, rgba(13,27,42,0.75) 55%, rgba(13,27,42,0.92) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(8,145,178,0.12) 0%,transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(217,119,6,0.08) 0%,transparent 70%)",
            bottom: -50,
            left: 100,
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "max(5rem, env(safe-area-inset-top, 0px)) max(0.9rem, env(safe-area-inset-right, 0px)) 4rem max(0.9rem, env(safe-area-inset-left, 0px))",
            width: "100%",
            position: "relative",
            zIndex: 2,
            boxSizing: "border-box",
          }}
        >
          <div className="gb-hero-2">
            <div className="fade-up">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--teal2)",
                  marginBottom: "1.2rem",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--teal2)",
                    animation: "pulse 2s infinite",
                  }}
                />
                Gilgit Baltistan · {BRAND.domain}
              </div>
              <HeroTypingHeadline />
              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.8,
                  maxWidth: 440,
                  marginBottom: "2rem",
                }}
              >
                Verified cars, jeeps, and SUVs from trusted local owners on {BRAND.domain}. From Hunza to Skardu — request online,
                pay locally.
              </p>
              <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                <Btn variant="gold" size="lg" onClick={() => navigate(PATH.listings)}>
                  Browse Cars →
                </Btn>
                <Btn variant="outline-white" size="lg" onClick={() => navigate(PATH.login)}>
                  List Your Car
                </Btn>
              </div>
              <div style={{ display: "flex", gap: "2rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
                {[
                  ["120+", "Verified Vehicles"],
                  ["14", "Destinations"],
                  ["4.9★", "Avg. Rating"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--gold2)",
                        letterSpacing: "-1px",
                      }}
                    >
                      {n}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up d-2">
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "var(--r-xl)",
                  padding: "1.8rem",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--teal2)",
                    marginBottom: "1.2rem",
                  }}
                >
                  🔍 Quick Search
                </div>
                <FormGroup
                  label={
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Destination</span>
                  }
                >
                  <select
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                  >
                    {["Hunza Valley", "Skardu", "Gilgit City", "Fairy Meadows", "Deosai Plains", "Naltar Valley", "Naran Kaghan"].map((d) => (
                      <option key={d} value={d} style={{ background: "var(--slate)", color: "#fff" }}>
                        {d}
                      </option>
                    ))}
                  </select>
                </FormGroup>
                <div className="gb-home-cta-2">
                  <FormGroup
                    label={
                      <span style={{ color: "rgba(255,255,255,0.45)" }}>Pick-up Date</span>
                    }
                  >
                    <input
                      type="date"
                      value={pickDate}
                      onChange={(e) => setPickDate(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                    />
                  </FormGroup>
                  <FormGroup
                    label={
                      <span style={{ color: "rgba(255,255,255,0.45)" }}>Return Date</span>
                    }
                  >
                    <input
                      type="date"
                      value={retDate}
                      onChange={(e) => setRetDate(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                    />
                  </FormGroup>
                </div>
                <FormGroup
                  label={
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Vehicle Type</span>
                  }
                >
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                  >
                    {[
                      ["any", "Any Type"],
                      ["suv", "🚙 SUV / 4WD"],
                      ["jeep", "🚐 Jeep"],
                      ["sedan", "🚗 Sedan"],
                      ["van", "🚌 Coaster / Van"],
                    ].map(([v, l]) => (
                      <option key={v} value={v} style={{ background: "var(--slate)", color: "#fff" }}>
                        {l}
                      </option>
                    ))}
                  </select>
                </FormGroup>
                <Btn variant="gold" block size="lg" onClick={() => navigate(PATH.listings)}>
                  Search Available Cars →
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          background: "var(--slate2)",
          padding: "0.9rem 0",
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{ display: "flex", animation: "ticker 40s linear infinite", whiteSpace: "nowrap", gap: "3rem" }}
        >
          {[...tickerText, ...tickerText, ...tickerText].map((t, i) => (
            <span
              key={`${t}-${i}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--gold)", fontSize: 7 }}>◆</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <section style={{ padding: "5rem 0", background: "var(--white)" }}>
        <div className="gb-wrap-1200">
          <Eyebrow>Why {BRAND.domain}</Eyebrow>
          <SectionTitle>
            Travel smarter, <em style={{ color: "var(--teal)", fontStyle: "italic" }}>safer, and further</em>
          </SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem", marginTop: "2.5rem" }}>
            {[
              [
                "✅",
                "Government Verified",
                "Every vehicle and owner is verified against national databases before listing. No unregistered vehicles, no surprises.",
              ],
              [
                "📍",
                "Local Experts",
                "Owners are locals who know these roads. They advise on routes, conditions, and hidden spots you won't find in guides.",
              ],
              [
                "📱",
                "Instant Booking",
                "Send a request online and get owner confirmation via SMS and email. Reserve your vehicle in minutes.",
              ],
              [
                "🛡",
                "Full Records",
                "Every booking is tracked and recorded. Complete transparency for both renters and owners throughout the journey.",
              ],
              [
                "💰",
                "Fair Pricing",
                "No hidden platform fees. Prices are set by owners. Pay directly and negotiate extras face-to-face.",
              ],
              [
                "🏔",
                "Terrain-Ready Fleet",
                "From jeeps built for K2 trails to comfortable SUVs for Hunza — every vehicle type covered for GB's diverse terrain.",
              ],
            ].map(([icon, title, desc]) => (
              <Card key={title} hover style={{ padding: "1.8rem" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "var(--teal-pale)",
                    border: "1px solid var(--teal-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: "1.1rem",
                  }}
                >
                  {icon}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.5rem" }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.7 }}>{desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--stone)" }}>
        <div className="gb-wrap-1200">
          <Eyebrow>Process</Eyebrow>
          <SectionTitle>
            Book in <em style={{ color: "var(--teal)", fontStyle: "italic" }}>four steps</em>
          </SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.5rem", marginTop: "2.5rem" }}>
            {[
              ["1", "Browse & Filter", "Find vehicles by destination, dates, type, and budget."],
              ["2", "Send Request", "Submit your booking request. Owner gets an instant SMS."],
              ["3", "Owner Confirms", "Owner accepts or declines within 12 hours. You get notified."],
              ["4", "Hit the Road", "Meet the owner, settle payment directly, and start your adventure."],
            ].map(([n, t, d]) => (
              <div key={n} style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "var(--slate)",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  {n}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: "0.4rem" }}>{t}</div>
                <div style={{ fontSize: 13, color: "var(--ink3)" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--white)" }}>
        <div className="gb-wrap-1200">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <Eyebrow>Top Vehicles</Eyebrow>
              <SectionTitle>
                Featured <em style={{ color: "var(--teal)", fontStyle: "italic" }}>rentals</em>
              </SectionTitle>
            </div>
            <Btn variant="outline" onClick={() => navigate(PATH.listings)}>
              View All Cars →
            </Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>
            {featured.map((car) => (
              <CarCard key={car.id} car={car} onClick={() => navigate(PATH.car(car.id))} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--slate)" }}>
        <div className="gb-wrap-1200">
          <Eyebrow>
            <span style={{ color: "var(--teal2)" }}>Explore</span>
          </Eyebrow>
          <SectionTitle>
            <span style={{ color: "#fff" }}>Popular </span>
            <em style={{ color: "var(--gold2)" }}>destinations</em>
          </SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.2rem",
              marginTop: "2rem",
            }}
          >
            {[
              ["🏔", "Hunza Valley", "38 vehicles"],
              ["⛺", "Fairy Meadows", "12 vehicles"],
              ["🏕", "Skardu", "27 vehicles"],
              ["🌋", "Deosai Plains", "9 vehicles"],
            ].map(([e, n, c]) => (
              <div
                key={n}
                onClick={() => navigate(PATH.listings)}
                style={{
                  borderRadius: "var(--r-lg)",
                  height: 200,
                  background: "linear-gradient(135deg, var(--slate2) 0%, var(--slate3) 100%)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-end",
                  transition: "transform 0.25s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-70%)",
                    fontSize: 52,
                  }}
                >
                  {e}
                </span>
                <div
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(13,27,42,0.9) 0%,transparent 55%)" }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: "1rem" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{n}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{c} available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--stone2)" }}>
        <div className="gb-wrap-1200">
          <Eyebrow>Reviews</Eyebrow>
          <SectionTitle>
            Trusted by <em style={{ color: "var(--teal)", fontStyle: "italic" }}>travellers</em>
          </SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem", marginTop: "2rem" }}>
            {[
              [
                "AK",
                "Ali Khan",
                "Lahore · July 2024",
                "Booked a Prado for Hunza in minutes. The owner met us at the hotel and the vehicle was immaculate. Fully worth it for the mountain roads.",
              ],
              [
                "SB",
                "Sara Baig",
                "Islamabad · August 2024",
                `Rented a Jimny for Deosai. The owner knew every track and gave us a detailed route briefing. Booking through ${BRAND.domain} was effortless.`,
              ],
              [
                "MR",
                "M. Raza",
                "Karachi · Sept 2024",
                "As a group of 12, we needed a Coaster. Found one same-day, owner was professional and the confirmation SMS came within 2 hours.",
              ],
            ].map(([init, name, loc, text]) => (
              <Card key={name} style={{ padding: "1.5rem" }}>
                <Stars n={5} />
                <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.75, fontStyle: "italic", margin: "0.8rem 0 1rem" }}>&ldquo;{text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--slate)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {init}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink4)" }}>{loc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "5rem 0",
          background: "linear-gradient(135deg, var(--teal) 0%, #0e7490 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="gb-wrap-1200" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.8rem",
              letterSpacing: "-0.5px",
            }}
          >
            Own a vehicle? Start earning today.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: "2rem" }}>
            List your car or jeep on {BRAND.domain} and reach travellers every season.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="gold" size="lg" onClick={() => navigate(PATH.login)}>
              List My Vehicle →
            </Btn>
            <Btn variant="outline-white" size="lg" onClick={() => navigate(PATH.howItWorks)}>
              Learn How It Works
            </Btn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
