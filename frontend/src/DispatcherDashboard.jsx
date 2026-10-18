import { useEffect, useState } from "react";

import IncidentList from "./IncidentList";
import { fetchIncidents } from "./incidentsApi";
import { isActiveIncident } from "./features/incidents/incidentStatusFilter";


function DispatcherDashboard() {
  const [incidents, setIncidents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchIncidents();

        setIncidents(data);
      } catch (error) {
        console.error(
          "Error loading incidents:",
          error
        );

        setError(
          error.message ||
            "Could not connect to the server. Make sure Django is running."
        );
      } finally {
        setLoading(false);
      }
    };


    loadIncidents();
  }, []);


  // The dashboard lists only incidents that still need attention. The
  // full list stays in state, so the history page's data is untouched.
  const activeIncidents =
    incidents.filter(isActiveIncident);


  return (
    <div className="page">

      <header className="page-header">

        <h1 className="page-title">
          Dashboard
        </h1>

        <p className="page-subtitle">
          Overview of current operations
        </p>

      </header>

      {/* Sections stack in one column. A future row of stat cards or a
          map card drops in here as another section without touching the
          markup below it. */}
      <div className="dashboard-sections">

        <section className="incident-section">

          {loading && (
            <div className="card state">

              <p>
                Loading incidents...
              </p>

            </div>
          )}


          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}


          {!loading && !error && (
            <IncidentList
              incidents={activeIncidents}
              setIncidents={
                setIncidents
              }
            />
          )}

        </section>

      </div>

    </div>
  );
}


export default DispatcherDashboard;
