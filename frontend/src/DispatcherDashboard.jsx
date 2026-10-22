import { useEffect, useState } from "react";

import IncidentList from "./IncidentList";
import { fetchIncidents } from "./incidentsApi";

function DispatcherDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchIncidents();

        if (!cancelled) {
          setIncidents(data);
        }
      } catch (error) {
        console.error("Error loading incidents:", error);

        if (!cancelled) {
          setError(
            error.message ||
              "Could not connect to the server. Make sure Django is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIncidents();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Refresh the dashboard after an assignment or status change.
   * The backend returns only unresolved incidents.
   */
  const refreshIncidents = async () => {
    try {
      setRefreshing(true);

      const data = await fetchIncidents();

      setIncidents(data);
      setRefreshFailed(false);
      setError("");
    } catch (error) {
      console.error("Error refreshing incidents:", error);
      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * Update the visible row immediately.
   * If the incident becomes Resolved, remove it from the active dashboard.
   * The refresh then confirms the server's current data.
   */
  const applyIncidentUpdate = (updatedIncident) => {
    if (updatedIncident.status === "Resolved") {
      setIncidents((currentIncidents) =>
        currentIncidents.filter(
          (incident) => incident.id !== updatedIncident.id,
        ),
      );
    } else {
      setIncidents((currentIncidents) => {
        const exists = currentIncidents.some(
          (incident) => incident.id === updatedIncident.id,
        );

        if (exists) {
          return currentIncidents.map((incident) =>
            incident.id === updatedIncident.id ? updatedIncident : incident,
          );
        }

        return [...currentIncidents, updatedIncident].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      });
    }

    refreshIncidents();
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>

        <p className="page-subtitle">Overview of current operations</p>
      </header>

      <div className="dashboard-sections">
        <section className="incident-section">
          {loading && (
            <div className="card state">
              <p>Loading incidents...</p>
            </div>
          )}

          {error && !loading && (
            <div className="alert alert-error" role="alert">
              {error}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={refreshIncidents}
                disabled={refreshing}
              >
                {refreshing ? "Retrying..." : "Try Again"}
              </button>
            </div>
          )}

          {refreshFailed && (
            <div className="alert alert-error refresh-error">
              <span role="alert">
                Could not refresh the incident list. The displayed data may be
                outdated.
              </span>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={refreshIncidents}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Try Again"}
              </button>
            </div>
          )}

          {!loading && !error && (
            <IncidentList
              incidents={incidents}
              refreshing={refreshing}
              onIncidentUpdated={applyIncidentUpdate}
              onRefresh={refreshIncidents}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default DispatcherDashboard;
