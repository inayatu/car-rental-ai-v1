/** Listing title cap — keeps cards and grids readable (aligned with API + DB). */
export const CAR_TITLE_MAX_LENGTH = 60;

/**
 * @param {string} [s]
 * @param {number} [max]
 */
export function truncateCarTitle(s, max = CAR_TITLE_MAX_LENGTH) {
  if (s == null || typeof s !== "string") return "";
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max);
}
