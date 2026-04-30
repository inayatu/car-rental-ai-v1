/**
 * Mongo filters + sort for GET /bookings/mine by actor role and UI tab.
 * Owner "upcoming" / "active" use date boundaries aligned with web bookingTabFilters.js (local server day).
 */

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * @param {string} actorId
 * @param {string} actorRole
 * @param {string} [tab]
 * @returns {{ query: object, sort: object }}
 */
function listMyBookingsQueryAndSort(actorId, actorRole, tab = "") {
  const t = (tab || "").toLowerCase();

  if (actorRole === "admin" || actorRole === "govt_staff") {
    return { query: {}, sort: { createdAt: -1 } };
  }

  if (actorRole === "renter") {
    const q = { renterId: actorId };
    if (t === "pending") return { query: { ...q, status: "requested" }, sort: { createdAt: -1 } };
    if (t === "active") return { query: { ...q, status: "accepted" }, sort: { createdAt: -1 } };
    if (t === "completed") return { query: { ...q, status: "completed" }, sort: { createdAt: -1 } };
    if (t === "declined") return { query: { ...q, status: { $in: ["rejected", "cancelled"] } }, sort: { createdAt: -1 } };
    /* all */
    return { query: q, sort: { createdAt: -1 } };
  }

  if (actorRole === "owner") {
    const q = { ownerId: actorId };
    if (t === "pending") return { query: { ...q, status: "requested" }, sort: { createdAt: -1 } };
    if (t === "completed") return { query: { ...q, status: "completed" }, sort: { startDate: -1 } };
    if (t === "declined") return { query: { ...q, status: { $in: ["rejected", "cancelled"] } }, sort: { createdAt: -1 } };
    if (t === "all") return { query: q, sort: { createdAt: -1 } };
    if (t === "upcoming") {
      return {
        query: { ...q, status: "accepted", startDate: { $gt: endOfToday() } },
        sort: { startDate: 1 },
      };
    }
    if (t === "active") {
      return {
        query: { ...q, status: "accepted", startDate: { $lte: endOfToday() } },
        sort: { startDate: 1 },
      };
    }
    return { query: { ...q, status: "requested" }, sort: { createdAt: -1 } };
  }

  return {
    query: { $or: [{ renterId: actorId }, { ownerId: actorId }] },
    sort: { createdAt: -1 },
  };
}

module.exports = { listMyBookingsQueryAndSort, endOfToday };
