import dayjs from "dayjs";

/** @param {string} s */
const tabIds = (s) =>
  s === "pending" ||
  s === "upcoming" ||
  s === "active" ||
  s === "completed" ||
  s === "declined"
    ? s
    : "pending";

/**
 * @param {string | null} tabParam
 * @returns {"pending" | "upcoming" | "active" | "completed" | "declined"}
 */
export function parseOwnerBookingTab(tabParam) {
  const s = (tabParam || "").toLowerCase();
  return /** @type {const} */ (tabIds(s));
}

/**
 * Future-only confirmed trips: accepted and trip starts after local end of today.
 * @param {Record<string, unknown> & { status?: string, startDate?: string, endDate?: string }} b
 */
export function isUpcoming(b) {
  if (b.status !== "accepted") return false;
  return dayjs(b.startDate).isAfter(dayjs().endOf("day"));
}

/**
 * Accepted, not a future start (includes in range, in progress, or trip ended but not status-completed).
 * @param {Record<string, unknown> & { status?: string, startDate?: string, endDate?: string }} b
 */
function isActiveRental(b) {
  if (b.status !== "accepted") return false;
  if (isUpcoming(b)) return false;
  return true;
}

/**
 * @param {import("dayjs").Dayjs} a
 * @param {import("dayjs").Dayjs} b
 */
function isSameOrBeforeDay(a, b) {
  return a.isBefore(b, "day") || a.isSame(b, "day");
}

/**
 * Ongoing: accepted and today is within the rental’s date range (inclusive, day level).
 * @param {Record<string, unknown> & { status?: string, startDate?: string, endDate?: string }} b
 */
function isOngoingRental(b) {
  if (b.status !== "accepted") return false;
  const now = dayjs();
  return isSameOrBeforeDay(dayjs(b.startDate), now) && (now.isBefore(dayjs(b.endDate), "day") || now.isSame(dayjs(b.endDate), "day"));
}

/**
 * @param {Record<string, unknown> & { status?: string, startDate?: string, endDate?: string, createdAt?: string }} b
 * @param {ReturnType<typeof parseOwnerBookingTab>} tab
 */
export function ownerBookingInTab(b, tab) {
  if (tab === "pending") return b.status === "requested";
  if (tab === "upcoming") return isUpcoming(b);
  if (tab === "active") return isActiveRental(b);
  if (tab === "completed") return b.status === "completed";
  if (tab === "declined") return b.status === "rejected" || b.status === "cancelled";
  return false;
}

/**
 * @param {Record<string, unknown> & { status?: string, startDate?: string, endDate?: string }} b
 * @returns {"upcoming" | "ongoing" | "ended"}
 */
export function activeRentalSubKind(b) {
  if (b.status !== "accepted") return "ended";
  if (isUpcoming(b)) return "upcoming";
  if (isOngoingRental(b)) return "ongoing";
  return "ended";
}

const renterTab = (s) => {
  const t = (s || "").toLowerCase();
  if (t === "all" || t === "") return "all";
  if (t === "pending" || t === "active" || t === "completed" || t === "declined") return t;
  return "all";
};

/**
 * @param {string | null} tabParam
 * @returns {"all" | "pending" | "active" | "completed" | "declined"}
 */
export function parseRenterBookingTab(tabParam) {
  return /** @type {const} */ (renterTab(tabParam));
}

/**
 * @param {Record<string, unknown> & { status?: string }} b
 * @param {ReturnType<typeof parseRenterBookingTab>} tab
 */
export function renterBookingInTab(b, tab) {
  if (tab === "all") return true;
  if (tab === "pending") return b.status === "requested";
  if (tab === "active") return b.status === "accepted";
  if (tab === "completed") return b.status === "completed";
  if (tab === "declined") return b.status === "rejected" || b.status === "cancelled";
  return true;
}
