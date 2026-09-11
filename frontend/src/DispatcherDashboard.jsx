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
        <p>Monitor reported truck incidents.</p>
      </div>

      <section className="incident-section">
        <h2>Reported Incidents</h2>

        {loading && <p>Loading incidents...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <IncidentList incidents={incidents} />
        )}
      </section>
    </div>
  );
}

export default DispatcherDashboard;