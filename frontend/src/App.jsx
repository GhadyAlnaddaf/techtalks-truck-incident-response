import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoginPage from "./features/auth/LoginPage";
import { ROLES } from "./features/auth/roles";
import IncidentReportForm from "./features/incidents/IncidentReportForm";
import DispatcherDashboard from "./DispatcherDashboard";
import IncidentHistory from "./features/incidents/IncidentHistory";

/* ===================================================================
   TEMP (TIR-62 replaces this)

   Preview-only wiring so the TIR-61 screens can be seen in the browser.
   No network calls, no auth state, no route guards.
   =================================================================== */

function LoginPreview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // No request and no fake success: show the loading state briefly, then
  // say plainly that sign-in is not wired up.
  const handleSubmit = () => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setError("Sign-in is not connected yet.");
    }, 500);
  };

  return <LoginPage onSubmit={handleSubmit} loading={loading} error={error} />;
}

// Defaults to truck_driver; ?role=dispatcher or ?role=truck_driver
// overrides it. Read once when the app loads, so it survives navigating
// between pages.
const requestedRole = new URLSearchParams(window.location.search).get("role");
const PREVIEW_ROLE = Object.values(ROLES).includes(requestedRole)
  ? requestedRole
  : ROLES.TRUCK_DRIVER;

// Logout only navigates to /login.
function ShellPreview() {
  const navigate = useNavigate();

  return <AppShell role={PREVIEW_ROLE} onLogout={() => navigate("/login")} />;
}

/* ======================= end TEMP (TIR-62) ======================== */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* TEMP (TIR-62 replaces this): LoginPreview and ShellPreview */}
        <Route path="/login" element={<LoginPreview />} />

        <Route element={<ShellPreview />}>
          <Route path="/" element={<IncidentReportForm />} />
          <Route path="/dispatcher" element={<DispatcherDashboard />} />
          <Route path="/history" element={<IncidentHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
