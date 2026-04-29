import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  Car,
  HeartHandshake,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Search,
} from "lucide-react";
import {
  CAR_BRANDS,
  CAR_COLORS,
  defaultBrand,
  defaultModelForBrand,
  getModelsForBrand,
} from "./lib/vehicleOptions.js";

const AUTH_KEY = "rental-auth";
const HOTELS_KEY = "host-hotels";
const HOTEL_BOOKINGS_KEY = "hotel-bookings";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return config;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.accessToken) {
      config.headers.Authorization = `Bearer ${parsed.accessToken}`;
    }
  } catch {
    // Ignore invalid localStorage payload.
  }
  return config;
});

const demoHotels = [
  {
    id: "demo-hotel-1",
    title: "Hunza Alpine Retreat",
    city: "Karimabad",
    district: "Hunza",
    basePricePerDay: 18000,
    currency: "PKR",
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80"],
    amenities: ["Mountain View", "WiFi", "Breakfast"],
    source: "demo",
  },
  {
    id: "demo-hotel-2",
    title: "Skardu Lakefront Suites",
    city: "Skardu",
    district: "Skardu",
    basePricePerDay: 22000,
    currency: "PKR",
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"],
    amenities: ["Airport Pickup", "Bonfire", "Restaurant"],
    source: "demo",
  },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function AppShell({ auth, onLogout, children }) {
  const location = useLocation();
  const navItems = [
    { to: "/", label: "Discover", icon: Home },
    { to: "/bookings", label: "Bookings", icon: CalendarCheck },
    ...(auth?.user?.role === "owner" ? [{ to: "/host", label: "Manage", icon: LayoutDashboard }] : []),
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <HeartHandshake size={18} />
          <span>gbtrip.pk</span>
        </Link>
        <nav className="top-actions">
          {!auth?.user ? (
            <>
              <Link className="ghost-btn" to="/login">
                Login
              </Link>
              <Link className="solid-btn" to="/register">
                Join
              </Link>
            </>
          ) : (
            <button className="ghost-btn inline-icon" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </nav>
      </header>
      <main className="content">{children}</main>
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={isActive ? "active" : ""}>
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function ListingCard({ type, item }) {
  const image = item.images?.[0] || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80";
  return (
    <article className="card listing-card">
      <img src={image} alt={item.title} />
      <div>
        <p className="chip">{type === "car" ? "Car" : "Hotel"}</p>
        <h3>{item.title}</h3>
        <p className="muted">
          {type === "car"
            ? `${item.brand} ${item.model} • ${item.location?.district || "Pakistan"}`
            : `${item.city || ""} ${item.district || ""}`}
        </p>
        <div className="card-footer">
          <strong>
            {item.currency || "PKR"} {item.basePricePerDay}/day
          </strong>
          <Link className="link-btn" to={`/listing/${type}/${item.id}`}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function HomePage({ cars, hotels }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const filteredCars = cars.filter((car) =>
    `${car.title} ${car.brand} ${car.model} ${car.location?.district || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const filteredHotels = hotels.filter((hotel) =>
    `${hotel.title} ${hotel.city || ""} ${hotel.district || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="page">
      <div className="hero card">
        <h1>Book cars and stays in one place.</h1>
        <p>Modern rental experience for travelers and renters. Fast search, instant bookings, easy management.</p>
        <label className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by model, title, city..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="segmented">
        {["all", "cars", "hotels"].map((value) => (
          <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="listing-grid">
        {(tab === "all" || tab === "cars") &&
          filteredCars.map((car) => <ListingCard key={car.id} type="car" item={car} />)}
        {(tab === "all" || tab === "hotels") &&
          filteredHotels.map((hotel) => <ListingCard key={hotel.id} type="hotel" item={hotel} />)}
      </div>
    </section>
  );
}

function ListingDetail({ cars, hotels, auth, onBookCar, onBookHotel }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(2, "day").format("YYYY-MM-DD"));
  const list = type === "car" ? cars : hotels;
  const item = list.find((entry) => entry.id === id);

  if (!item) {
    return <p className="page muted">Listing not found.</p>;
  }

  const book = async () => {
    if (!auth?.user) {
      navigate("/login");
      return;
    }
    if (type === "car") {
      await onBookCar(item.id, startDate, endDate);
    } else {
      onBookHotel(item, startDate, endDate);
    }
    navigate("/bookings");
  };

  return (
    <section className="page detail-layout">
      <img
        className="hero-image"
        src={item.images?.[0] || "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80"}
        alt={item.title}
      />
      <div className="card">
        <p className="chip">{type === "car" ? "Car Rental" : "Hotel Stay"}</p>
        <h2>{item.title}</h2>
        <p className="muted">{item.description || "Premium listing with comfortable experience and verified host support."}</p>
        <p className="price-tag">
          {item.currency || "PKR"} {item.basePricePerDay} / day
        </p>

        <div className="booking-form">
          <label>
            Start
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label>
            End
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button className="solid-btn" onClick={book}>
            Confirm Booking
          </button>
        </div>
      </div>
    </section>
  );
}

function BookingsPage({ auth, bookings, onUpdateBooking }) {
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <section className="page">
      <h2>Your bookings</h2>
      <div className="stack">
        {bookings.length === 0 && <p className="muted">No bookings yet. Start by exploring listings.</p>}
        {bookings.map((booking) => (
          <article className="card booking-card" key={booking.id}>
            <div>
              <p className="chip">{booking.type.toUpperCase()}</p>
              <h3>{booking.title}</h3>
              <p className="muted">
                {dayjs(booking.startDate).format("DD MMM YYYY")} - {dayjs(booking.endDate).format("DD MMM YYYY")}
              </p>
            </div>
            <div>
              <span className={`status ${booking.status}`}>{booking.status}</span>
              {booking.type === "car" && auth.user.role === "owner" && booking.status === "requested" && (
                <div className="inline-actions">
                  <button onClick={() => onUpdateBooking(booking.id, "accepted")}>Accept</button>
                  <button onClick={() => onUpdateBooking(booking.id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HostPage({ auth, cars, hotels, onCreateCar, onCreateHotel }) {
  const [carForm, setCarForm] = useState({
    title: "",
    brand: defaultBrand,
    model: defaultModelForBrand(defaultBrand),
    year: "2020",
    registrationNumber: "",
    basePricePerDay: "12000",
    district: "Gilgit",
    color: "",
  });
  const [hotelForm, setHotelForm] = useState({
    title: "",
    city: "",
    district: "Hunza",
    basePricePerDay: "15000",
  });

  if (!auth?.user || auth.user.role !== "owner") {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="page">
      <h2>Renter dashboard</h2>
      <p className="muted">Manage your cars and hotels from one modern workspace.</p>

      <div className="manage-grid">
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateCar(carForm);
            setCarForm((prev) => ({
              ...prev,
              title: "",
              registrationNumber: "",
              brand: defaultBrand,
              model: defaultModelForBrand(defaultBrand),
              color: "",
            }));
          }}
        >
          <h3 className="inline-icon">
            <Car size={17} /> Add car
          </h3>
          <input
            placeholder="title"
            value={carForm.title}
            onChange={(e) => setCarForm((p) => ({ ...p, title: e.target.value }))}
          />
          <span className="muted" style={{ fontSize: 12 }}>
            Brand
          </span>
          <select
            value={carForm.brand}
            onChange={(e) => {
              const b = e.target.value;
              setCarForm((p) => {
                const models = getModelsForBrand(b);
                const nextModel = models.includes(p.model) ? p.model : models[0];
                return { ...p, brand: b, model: nextModel };
              });
            }}
          >
            {CAR_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="muted" style={{ fontSize: 12 }}>
            Model
          </span>
          <select value={carForm.model} onChange={(e) => setCarForm((p) => ({ ...p, model: e.target.value }))}>
            {getModelsForBrand(carForm.brand).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            placeholder="year"
            value={carForm.year}
            onChange={(e) => setCarForm((p) => ({ ...p, year: e.target.value }))}
          />
          <input
            placeholder="registrationNumber"
            value={carForm.registrationNumber}
            onChange={(e) => setCarForm((p) => ({ ...p, registrationNumber: e.target.value }))}
          />
          <input
            placeholder="basePricePerDay"
            value={carForm.basePricePerDay}
            onChange={(e) => setCarForm((p) => ({ ...p, basePricePerDay: e.target.value }))}
          />
          <input
            placeholder="district"
            value={carForm.district}
            onChange={(e) => setCarForm((p) => ({ ...p, district: e.target.value }))}
          />
          <span className="muted" style={{ fontSize: 12 }}>
            Color
          </span>
          <select value={carForm.color} onChange={(e) => setCarForm((p) => ({ ...p, color: e.target.value }))}>
            <option value="">— optional —</option>
            {CAR_COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="solid-btn">Save car</button>
        </form>

        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateHotel(hotelForm);
            setHotelForm({ ...hotelForm, title: "", city: "" });
          }}
        >
          <h3 className="inline-icon">
            <BedDouble size={17} /> Add hotel
          </h3>
          {Object.keys(hotelForm).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={hotelForm[key]}
              onChange={(event) => setHotelForm((prev) => ({ ...prev, [key]: event.target.value }))}
            />
          ))}
          <button className="solid-btn">Save hotel</button>
        </form>
      </div>

      <div className="manage-grid">
        <article className="card">
          <h3 className="inline-icon">
            <ListChecks size={17} /> My cars ({cars.length})
          </h3>
          {cars.map((car) => (
            <p key={car.id} className="muted">
              {car.title} - {car.basePricePerDay} {car.currency}
            </p>
          ))}
        </article>
        <article className="card">
          <h3 className="inline-icon">
            <BedDouble size={17} /> My hotels ({hotels.length})
          </h3>
          {hotels.map((hotel) => (
            <p key={hotel.id} className="muted">
              {hotel.title} - {hotel.basePricePerDay} {hotel.currency}
            </p>
          ))}
        </article>
      </div>
    </section>
  );
}

function AuthPage({ mode, onSubmit }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    emailOrPhone: "",
    email: "",
    phone: "",
    password: "",
    role: "renter",
  });
  const isRegister = mode === "register";
  return (
    <section className="page auth-page">
      <form
        className="card stack auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit(form, isRegister);
          navigate("/");
        }}
      >
        <h2>{isRegister ? "Create account" : "Welcome back"}</h2>
        {isRegister && (
          <>
            <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="renter">Renter</option>
              <option value="owner">Owner</option>
            </select>
          </>
        )}
        {!isRegister && (
          <input
            placeholder="Email or phone"
            value={form.emailOrPhone}
            onChange={(event) => setForm({ ...form, emailOrPhone: event.target.value })}
          />
        )}
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button className="solid-btn">{isRegister ? "Create account" : "Login"}</button>
      </form>
    </section>
  );
}

function App() {
  const [auth, setAuth] = useState(() => readJson(AUTH_KEY, null));
  const [cars, setCars] = useState([]);
  const [ownerCars, setOwnerCars] = useState([]);
  const [hotels, setHotels] = useState(() => [...demoHotels, ...readJson(HOTELS_KEY, [])]);
  const [bookings, setBookings] = useState([]);

  const ownerHotels = useMemo(() => hotels.filter((hotel) => hotel.source === "owner"), [hotels]);

  const loadCars = async () => {
    const response = await api.get("/cars", { params: { limit: 50, sort: "newest" } });
    setCars(response.data?.cars || []);
  };

  const loadOwnerCars = async () => {
    if (auth?.user?.role !== "owner") return setOwnerCars([]);
    const response = await api.get("/cars/mine");
    setOwnerCars(response.data?.cars || []);
  };

  const loadHotels = async () => {
    try {
      const response = await api.get("/hotels");
      const serverHotels = response.data?.hotels || [];
      setHotels([...serverHotels, ...readJson(HOTELS_KEY, []), ...demoHotels]);
    } catch {
      setHotels([...demoHotels, ...readJson(HOTELS_KEY, [])]);
    }
  };

  const loadBookings = async () => {
    const hotelBookings = readJson(HOTEL_BOOKINGS_KEY, []);
    if (!auth?.accessToken) {
      setBookings(hotelBookings);
      return;
    }
    try {
      const response = await api.get("/bookings/mine");
      const carBookings = (response.data?.bookings || []).map((booking) => ({
        id: booking.id,
        type: "car",
        title: booking.car?.title || "Car booking",
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
      }));
      setBookings([...carBookings, ...hotelBookings]);
    } catch {
      setBookings(hotelBookings);
    }
  };

  useEffect(() => {
    loadCars();
    loadHotels();
  }, []);

  useEffect(() => {
    loadOwnerCars();
    loadBookings();
    // Loader functions read current auth state; rerun whenever auth changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const onAuthSubmit = async (form, isRegister) => {
    const payload = isRegister
      ? { name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role }
      : { emailOrPhone: form.emailOrPhone, password: form.password };
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const response = await api.post(endpoint, payload);
    const data = { accessToken: response.data.accessToken, user: response.data.user };
    setAuth(data);
    persistJson(AUTH_KEY, data);
  };

  const onLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Allow local logout even if server is down.
    }
    setAuth(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const onBookCar = async (carId, startDate, endDate) => {
    const u = auth?.user;
    await api.post("/bookings", {
      carId,
      startDate: dayjs(startDate).startOf("day").toISOString(),
      endDate: dayjs(endDate).endOf("day").toISOString(),
      renterName: u?.name || "Renter",
      numberOfPersons: 1,
      renterPhone: u?.phone || "00000000",
      renterEmail: u?.email || "renter@example.com",
    });
    await loadBookings();
  };

  const onBookHotel = (hotel, startDate, endDate) => {
    const entries = readJson(HOTEL_BOOKINGS_KEY, []);
    const next = [
      ...entries,
      {
        id: `hotel-booking-${Date.now()}`,
        type: "hotel",
        title: hotel.title,
        startDate,
        endDate,
        status: "requested",
      },
    ];
    persistJson(HOTEL_BOOKINGS_KEY, next);
    setBookings((prev) => [...prev, next[next.length - 1]]);
  };

  const onUpdateBooking = async (bookingId, status) => {
    await api.patch(`/bookings/${bookingId}`, { status });
    await loadBookings();
  };

  const onCreateCar = async (form) => {
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("brand", form.brand);
    payload.append("model", form.model);
    payload.append("year", form.year);
    payload.append("registrationNumber", form.registrationNumber);
    payload.append("basePricePerDay", form.basePricePerDay);
    payload.append("district", form.district);
    if (form.color) payload.append("color", form.color);
    payload.append("vehicleType", "suv_4wd");
    payload.append("currency", "PKR");
    payload.append("status", "active");
    payload.append(
      "documents",
      JSON.stringify([
        {
          docType: "registration_certificate",
          url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
        },
      ])
    );
    await api.post("/cars", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await Promise.all([loadCars(), loadOwnerCars()]);
  };

  const onCreateHotel = (form) => {
    const ownerHotel = {
      id: `owner-hotel-${Date.now()}`,
      title: form.title,
      city: form.city,
      district: form.district,
      basePricePerDay: Number(form.basePricePerDay),
      currency: "PKR",
      images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80"],
      source: "owner",
    };
    const next = [...readJson(HOTELS_KEY, []), ownerHotel];
    persistJson(HOTELS_KEY, next);
    setHotels((prev) => [...prev, ownerHotel]);
  };

  return (
    <BrowserRouter>
      <AppShell auth={auth} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<HomePage cars={cars} hotels={hotels} />} />
          <Route path="/login" element={<AuthPage mode="login" onSubmit={onAuthSubmit} />} />
          <Route path="/register" element={<AuthPage mode="register" onSubmit={onAuthSubmit} />} />
          <Route
            path="/listing/:type/:id"
            element={
              <ListingDetail
                cars={cars}
                hotels={hotels}
                auth={auth}
                onBookCar={onBookCar}
                onBookHotel={onBookHotel}
              />
            }
          />
          <Route path="/bookings" element={<BookingsPage auth={auth} bookings={bookings} onUpdateBooking={onUpdateBooking} />} />
          <Route
            path="/host"
            element={
              <HostPage
                auth={auth}
                cars={ownerCars}
                hotels={ownerHotels}
                onCreateCar={onCreateCar}
                onCreateHotel={onCreateHotel}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
