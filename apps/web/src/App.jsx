import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Nav } from "./components/layout/Nav.jsx";
import { RequireAuth } from "./components/auth/RequireAuth.jsx";
import { RequireRole } from "./components/auth/RequireRole.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { afterLoginPath, PATH } from "./lib/paths.js";
import { PageAddListing } from "./pages/PageAddListing.jsx";
import { PageAdmin } from "./pages/PageAdmin.jsx";
import { PageAuth } from "./pages/PageAuth.jsx";
import { PageDetail } from "./pages/PageDetail.jsx";
import { PageHome } from "./pages/PageHome.jsx";
import { PageListings } from "./pages/PageListings.jsx";
import { PageOwnerBookings } from "./pages/PageOwnerBookings.jsx";
import { PageOwnerDashboard } from "./pages/PageOwnerDashboard.jsx";
import { PageProfile } from "./pages/PageProfile.jsx";
import { PageRenterDashboard } from "./pages/PageRenterDashboard.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { user, status } = useAuth();

  if (status !== "ready") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1b2a",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path={PATH.home} element={<PageHome />} />
        <Route path={PATH.listings} element={<PageListings />} />
        <Route path="/cars/:carId" element={<PageDetail />} />
        <Route
          path={PATH.login}
          element={user ? <Navigate to={afterLoginPath(user.role)} replace /> : <PageAuth />}
        />
        <Route
          path={PATH.profile}
          element={
            <RequireAuth>
              <PageProfile />
            </RequireAuth>
          }
        />
        <Route
          path={PATH.renterDashboard}
          element={
            <RequireAuth>
              <RequireRole allow={(u) => u?.role === "renter"}>
                <PageRenterDashboard />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path={PATH.ownerDashboard}
          element={
            <RequireAuth>
              <RequireRole allow={(u) => u?.role === "owner"}>
                <PageOwnerDashboard />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path={PATH.ownerBookings}
          element={
            <RequireAuth>
              <RequireRole allow={(u) => u?.role === "owner"}>
                <PageOwnerBookings />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path={PATH.addVehicle}
          element={
            <RequireAuth>
              <RequireRole allow={(u) => u?.role === "owner"}>
                <PageAddListing />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path={PATH.hotels} element={<Navigate to={PATH.home} replace />} />
        <Route
          path={PATH.admin}
          element={
            <RequireAuth>
              <RequireRole allow={(u) => u?.role === "admin" || u?.role === "govt_staff"}>
                <PageAdmin />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={PATH.home} replace />} />
      </Routes>
    </div>
  );
}
