/**
 * Status filters for the incident history page (TIR-61) and the
 * dispatcher dashboard (TIR-73).
 *
 * Pure, so they run under `npm test`, and they work only on data the
 * pages already load. Incident.status is a free-text CharField on the
 * backend, so statuses are compared the way StatusBadge compares them:
 * trimmed, lower-cased, with runs of whitespace collapsed.
 */

/** The workflow order of VALID_STATUSES in backend/incidents/views.py. */
const WORKFLOW_ORDER = [
  "pending",
  "assigned",
  "on the way",
  "in progress",
  "resolved",
];

const normalise = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const rank = (key) => {
  const index = WORKFLOW_ORDER.indexOf(key);
  return index === -1 ? WORKFLOW_ORDER.length : index;
};

/**
 * The statuses present in the data, once each, for the filter's options.
 * Workflow statuses come first in workflow order, anything else after
 * them alphabetically. Only present statuses are offered, so no option
 * ever leads to an empty table.
 *
 * @returns {string[]} Each status with the capitalisation it first has in
 *   the data, trimmed and with runs of spaces collapsed.
 */
export function getStatusOptions(incidents) {
  if (!Array.isArray(incidents)) return [];

  const byKey = new Map();

  for (const { status } of incidents) {
    const key = normalise(status);
    if (key && !byKey.has(key)) {
      byKey.set(key, String(status).trim().replace(/\s+/g, " "));
    }
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([, label]) => label);
}

/**
 * @param {string | null | undefined} status - An option from
 *   getStatusOptions, or "" for all statuses.
 * @returns The incidents with that status; all of them when none is chosen.
 */
export function filterByStatus(incidents, status) {
  if (!Array.isArray(incidents)) return [];

  const wanted = normalise(status);
  if (!wanted) return incidents;

  return incidents.filter((incident) => normalise(incident.status) === wanted);
}

/**
 * Whether an incident belongs on the dispatcher dashboard, which shows
 * every incident that is not Resolved. An incident with a missing or
 * unrecognised status stays visible, so nothing is hidden unless it is
 * definitely resolved.
 *
 * @returns {boolean} false for a Resolved incident, or for anything that
 *   is not an incident object at all.
 */
export function isActiveIncident(incident) {
  if (!incident || typeof incident !== "object") return false;

  return normalise(incident.status) !== "resolved";
}
