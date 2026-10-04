import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoginPage from "./features/auth/LoginPage";
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

/* ======================= end TEMP (TIR-62) ======================== */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* TEMP (TIR-62 replaces this): LoginPreview */}
        <Route path="/login" element={<LoginPreview />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<IncidentReportForm />} />
          <Route path="/dispatcher" element={<DispatcherDashboard />} />
          <Route path="/history" element={<IncidentHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
