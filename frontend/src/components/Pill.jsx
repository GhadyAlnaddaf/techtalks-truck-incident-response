import "./Pill.css";

/**
 * The shared pill shape (TIR-54).
 *
 * Presentational only: it knows about colour, not about meaning. Wrap it
 * in a component that maps domain values onto a tone -- StatusBadge does
 * this for incident status, and a future UrgencyBadge or TypeBadge can do
 * the same without touching this file.
 */

const TONES = ["amber", "blue", "violet", "cyan", "green", "grey", "red"];

function Pill({ tone = "grey", children }) {
  // An unrecognised tone falls back to neutral grey rather than rendering
  // an unstyled pill.
  const safeTone = TONES.includes(tone) ? tone : "grey";

  return <span className={`pill pill-${safeTone}`}>{children}</span>;
}

export default Pill;
