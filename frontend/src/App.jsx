import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import IncidentReportForm from './features/incidents/IncidentReportForm'
import DispatcherDashboard from './DispatcherDashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Report Incident</Link>
        <Link to="/dispatcher">Dispatcher Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<IncidentReportForm />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App