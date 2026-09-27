import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Order matters: global tokens and base styles first, then app-level
   styles, then component styles (imported by the components themselves). */
import "./index.css";
import "./App.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
