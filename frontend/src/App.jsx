import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import IncidentReportForm from "./features/incidents/IncidentReportForm";
import DispatcherDashboard from "./DispatcherDashboard";
import IncidentHistory from "./features/incidents/IncidentHistory";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Report Incident</Link>
        <Link to="/dispatcher">Dispatcher Dashboard</Link>
        <Link to="/history">Incident History</Link>
      </nav>

      <Routes>
        <Route path="/" element={<IncidentReportForm />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/history" element={<IncidentHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
