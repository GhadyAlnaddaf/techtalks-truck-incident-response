/**
 * Formats a backend timestamp for display.
 *
 *   "2026-09-16T10:42:00Z"  ->  "Sep 16, 2026, 10:42 AM"
 *
 * Medium date and short time in en-US, rendered in the viewer's own time
 * zone, matching the mockup.
 *
 * Pure and defensive: the backend sends ISO strings, but the value is
 * rendered straight into the table, so anything unparseable is returned
 * unchanged rather than showing "Invalid Date".
 *
 * @param {unknown} value - Timestamp from the API.
 * @returns {string} Formatted timestamp, or the original value.
 */
export function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
