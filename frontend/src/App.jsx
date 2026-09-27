import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import IncidentReportForm from "./features/incidents/IncidentReportForm";
import DispatcherDashboard from "./DispatcherDashboard";
import IncidentHistory from "./features/incidents/IncidentHistory";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<IncidentReportForm />} />
          <Route path="/dispatcher" element={<DispatcherDashboard />} />
          <Route path="/history" element={<IncidentHistory />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
