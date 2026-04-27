/** @typedef {{ role?: string }} UserLike */

export const PATH = {
  home: "/",
  listings: "/listings",
  car: (id) => `/cars/${encodeURIComponent(String(id))}`,
  login: "/login",
  profile: "/profile",
  renterDashboard: "/dashboard/renter",
  ownerDashboard: "/dashboard/owner",
  ownerBookings: "/dashboard/owner/bookings",
  addVehicle: "/dashboard/vehicles/new",
  hotels: "/hotels",
  admin: "/admin",
};

/**
 * @param {UserLike | null | undefined} user
 * @returns {string | null}
 */
export function dashboardPathForUser(user) {
  if (!user) return null;
  if (user.role === "owner") return PATH.ownerDashboard;
  if (user.role === "renter") return PATH.renterDashboard;
  if (user.role === "admin" || user.role === "govt_staff") return PATH.admin;
  return null;
}

/**
 * @param {string} [role]
 * @returns {string}
 */
export function afterLoginPath(role) {
  if (role === "owner") return PATH.ownerDashboard;
  if (role === "admin" || role === "govt_staff") return PATH.admin;
  return PATH.renterDashboard;
}

/**
 * @param {string} pathname
 * @param {string} match
 * @returns {boolean}
 */
export function pathIs(pathname, match) {
  return pathname === match || pathname.startsWith(`${match}/`);
}
