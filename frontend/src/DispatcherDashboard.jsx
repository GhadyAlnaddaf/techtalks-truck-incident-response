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

  // A re-fetch after an update. Unlike the first load, it keeps the
  // table on screen while it runs.
  const [refreshing, setRefreshing] =
    useState(false);

  // Set when that re-fetch fails. The update itself still went through,
  // so the rows keep what the server returned for it.
  const [refreshFailed, setRefreshFailed] =
    useState(false);


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


  /*
   * Re-fetch the list after an assignment or status change, so the
   * server stays the single source of truth.
   */
  const refreshIncidents = async () => {
    try {
      setRefreshing(true);

      const data =
        await fetchIncidents();

      setIncidents(data);
      setRefreshFailed(false);
    } catch (error) {
      console.error(
        "Error refreshing incidents:",
        error
      );

      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  };


  /*
   * Put the incident an update returned into the list straight away, so
   * its row changes before the re-fetch is back.
   */
  const applyIncidentUpdate = (updatedIncident) => {
    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === updatedIncident.id
          ? updatedIncident
          : incident
      )
    );
  };


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


          {refreshFailed && (
            <div className="alert alert-error refresh-error">
              {/* Worded so it never reads as a failed update: the
                  update went through, only the list is out of date. */}
              <span role="alert">
                Updated, but couldn't refresh the list.
              </span>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={refreshIncidents}
                disabled={refreshing}
              >
                Try Again
              </button>
            </div>
          )}


          {!loading && !error && (
            <IncidentList
              incidents={activeIncidents}
              refreshing={refreshing}
              onIncidentUpdated={
                applyIncidentUpdate
              }
              onRefresh={refreshIncidents}
            />
          )}

        </section>

      </div>

    </div>
  );
}


export default DispatcherDashboard;
