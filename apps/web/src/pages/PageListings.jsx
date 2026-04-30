import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Footer } from "../components/layout/Footer.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { CarCard } from "../components/cars/CarCard.jsx";
import { api } from "../lib/apiClient.js";
import { mapApiCarToDisplay } from "../lib/carMappers.js";
import { PATH } from "../lib/paths.js";
import { contentMax } from "../lib/pageLayout.js";
import { VEHICLE_TYPES } from "../lib/vehicleTypes.js";
import { Pagination } from "../components/ui/Pagination.jsx";

const LIST_PAGE_SIZE = 12;

const sortMap = {
  recommended: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  rating: "newest",
};

export function PageListings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [priceMax, setPriceMax] = useState(15000);
  const [sort, setSort] = useState("recommended");
  const [showFilter, setShowFilter] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiSort = sortMap[sort] || "newest";

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await api.get("/cars", {
          params: {
            limit: LIST_PAGE_SIZE,
            sort: apiSort,
            maxPrice: priceMax,
            page,
            ...(vehicleType ? { vehicleType } : {}),
          },
        });
        if (cancel) return;
        const raw = data?.cars || [];
        setList(raw.map((c) => mapApiCarToDisplay(c)).filter(Boolean));
        const t = data?.total ?? raw.length;
        setTotal(t);
        const tp = data?.totalPages;
        setTotalPages(typeof tp === "number" && tp > 0 ? tp : Math.max(1, Math.ceil(t / LIST_PAGE_SIZE)));
      } catch (e) {
        if (!cancel) setLoadError(e?.response?.data?.message || e?.message || "Could not load cars.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [apiSort, priceMax, vehicleType, page]);

  const resetListPage = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      return next;
    });
  };

  const setPage = (nextPage) => {
    const n = Math.max(1, nextPage);
    const next = new URLSearchParams(searchParams);
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    setSearchParams(next);
  };

  const FilterPanel = () => (
    <div
      style={{
        background: "var(--white)",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--border)",
        padding: "1.4rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Filters</span>
        <span
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setVehicleType("")}
          style={{ fontSize: 11, color: "var(--teal)", cursor: "pointer", fontWeight: 600 }}
          onClick={() => {
            setVehicleType("");
            setPriceMax(20000);
            resetListPage();
          }}
        >
          Clear all
        </span>
      </div>
      <div style={{ marginBottom: "1.3rem" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink3)",
            marginBottom: "0.7rem",
          }}
        >
          Vehicle type
        </div>
        <select
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value);
            resetListPage();
          }}
          style={{ width: "100%", fontSize: 14, padding: "8px 10px" }}
        >
          <option value="">All types</option>
          {VEHICLE_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "1.3rem" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink3)",
            marginBottom: "0.7rem",
          }}
        >
          Price per Day (PKR)
        </div>
        <input
          type="range"
          min={2000}
          max={20000}
          value={priceMax}
          onChange={(e) => {
            setPriceMax(Number(e.target.value));
            resetListPage();
          }}
          style={{ width: "100%", border: "none", padding: 0 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink3)", marginTop: 5 }}>
          <span>PKR 2,000</span>
          <span>Up to PKR {priceMax.toLocaleString()}</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--ink4)", margin: "0.5rem 0 0" }}>Filters update the list as you change them.</p>
      </div>
      {showFilter && (
        <Btn variant="outline" block onClick={() => setShowFilter(false)} style={{ marginTop: "0.6rem" }}>
          Close
        </Btn>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ background: "var(--slate)", padding: "5rem 0 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <Eyebrow>
            <span style={{ color: "var(--teal2)" }}>Browse Vehicles</span>
          </Eyebrow>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              marginBottom: 4,
            }}
          >
            Available Cars in Gilgit Baltistan
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Verified cars from local owners · API-backed list</p>
        </div>
      </div>

      <div style={contentMax(1200)}>
        <div className="show-mobile" style={{ marginBottom: "1rem" }}>
          <Btn variant="outline" onClick={() => setShowFilter(!showFilter)}>
            ⚙ Filters
          </Btn>
        </div>
        {showFilter && (
          <div className="show-mobile" style={{ marginBottom: "1.5rem" }}>
            <FilterPanel />
          </div>
        )}

        <div className="gb-listings-layout">
          <div className="hide-mobile" style={{ position: "sticky", top: 80, height: "fit-content", minWidth: 0 }}>
            <FilterPanel />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "0.8rem",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--ink3)" }}>
                <strong style={{ color: "var(--ink)" }}>{total || list.length}</strong> found
                {loadError && ` · ${loadError}`}
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  resetListPage();
                }}
                style={{ width: "auto", padding: "7px 12px", fontSize: 13 }}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating: Highest</option>
              </select>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                gap: "1.3rem",
              }}
            >
              {loading && <p style={{ gridColumn: "1 / -1" }}>Loading vehicles…</p>}
              {!loading &&
                list.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onClick={() => navigate(PATH.car(car.id))}
                  />
                ))}
            </div>
            {!loading && list.length > 0 ? (
              <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
