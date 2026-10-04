import { Truck } from "lucide-react";

import "./Brand.css";

/**
 * The product mark: icon plus name (TIR-61).
 *
 * The one place the brand is drawn. The app shell (sidebar, top bar,
 * drawer) and the login page all render this, so a rename or a real logo
 * is a change to this file only. Styled for the navy brand surface.
 */
function Brand() {
  return (
    <span className="brand">
      <Truck size={22} aria-hidden="true" />
      <span className="brand-name">Truck Response</span>
    </span>
  );
}

export default Brand;
