/** The types recorded in backend/incidents/views.py (IncidentHistory.EVENT_TYPES). */
const LABELS = {
  CREATED: "Created",
  STATUS_CHANGED: "Status changed",
  ASSISTANCE_ASSIGNED: "Assistance assigned",
};

/**
 * Labels an incident history event type for display (TIR-61).
 *
 *   "STATUS_CHANGED"  ->  "Status changed"
 *
 * The label is real text, so screen readers and copy and paste get the
 * same words the page shows. Pure, so it runs under `npm test`.
 *
 * @param {unknown} eventType - IncidentHistory.event_type from the API.
 * @returns {string} The label, or "" when there is no type.
 */
export function formatEventType(eventType) {
  const key = String(eventType ?? "").trim().toUpperCase();

  if (!key) return "";
  if (Object.hasOwn(LABELS, key)) return LABELS[key];

  // An unknown type still reads as words: "PHOTO_ADDED" -> "Photo added".
  const words = key.toLowerCase().split("_").filter(Boolean).join(" ");

  return words.charAt(0).toUpperCase() + words.slice(1);
}
