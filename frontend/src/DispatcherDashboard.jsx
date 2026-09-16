import { useEffect, useState } from "react";
import IncidentList from "./IncidentList";

function DispatcherDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/incidents/list/"
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to retrieve incidents.");
          return;
        }

        setIncidents(data.incidents);
      } catch (error) {
        console.error("Error connecting to the API:", error);

        setError(
          "Could not connect to the server. Make sure Django is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dispatcher Dashboard</h1>
        <p>Monitor and manage reported truck incidents.</p>
      </div>

      <section className="incident-section">
        <div className="section-header">
          <div>
            <h2>Incidents</h2>
            <p>Select an incident to view its full details.</p>
          </div>

          <span className="incident-count">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && (
          <div className="message-box">
            <p>Loading incidents...</p>
          </div>
        )}

        {error && (
          <div className="message-box error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <IncidentList
            incidents={incidents}
            setIncidents={setIncidents}
          />
        )}
      </section>
    </div>
  );
}

export default DispatcherDashboard;