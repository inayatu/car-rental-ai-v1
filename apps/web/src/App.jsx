import { useEffect, useRef, useState } from "react";
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
import { PageAbout } from "./pages/PageAbout.jsx";
import { PageHowItWorks } from "./pages/PageHowItWorks.jsx";
import { PageSafetyPolicy } from "./pages/PageSafetyPolicy.jsx";
import { GbTripSiteLoader } from "./components/brand/GbTripSiteLoader.jsx";

/** Minimum time the branded loader stays visible on first paint (ms). */
const BOOT_SPLASH_MIN_MS = 720;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { user, status } = useAuth();
  const mountedAt = useRef(Date.now());
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    if (status !== "ready") return undefined;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, BOOT_SPLASH_MIN_MS - elapsed);
    const t = window.setTimeout(() => setBootComplete(true), wait);
    return () => window.clearTimeout(t);
  }, [status]);

  if (!bootComplete) {
    return <GbTripSiteLoader />;
  }

  return (
    <div>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path={PATH.home} element={<PageHome />} />
        <Route path={PATH.about} element={<PageAbout />} />
        <Route path={PATH.howItWorks} element={<PageHowItWorks />} />
        <Route path={PATH.safetyPolicy} element={<PageSafetyPolicy />} />
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
