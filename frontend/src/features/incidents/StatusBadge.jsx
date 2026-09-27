import Pill from "../../components/Pill";

/**
 * Incident status as a labelled, colour-coded pill (TIR-54).
 *
 * Incident.status is a free-text CharField on the backend (default
 * "Pending"), so this matches case-insensitively and falls back to a
 * neutral grey pill for anything it does not recognise. The status text
 * is always rendered, so the colour is never the only signal.
 *
 * The live values enforced by VALID_STATUSES in backend/incidents/views.py
 * are Pending, Assigned, On the way, In progress and Resolved. The extra
 * keys below are defensive: the column is free text, so older or
 * hand-edited rows may hold something else.
 */

const STATUS_TONES = {
  pending: "amber",
  reported: "amber",
  "waiting for assistance": "amber",
  assigned: "blue",
  "on the way": "violet",
  "in progress": "cyan",
  resolved: "green",
  closed: "green",
  cancelled: "grey",
  canceled: "grey",
  rejected: "grey",
};

/** Lower-cases and collapses whitespace so "On  The Way" still matches. */
const normalise = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function StatusBadge({ status }) {
  const tone = STATUS_TONES[normalise(status)] || "grey";
  const label = String(status ?? "").trim();

  return <Pill tone={tone}>{label || "Unknown"}</Pill>;
}

export default StatusBadge;
