import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import "./IncidentHistory.css";

import { fetchIncidents, fetchIncidentHistory } from "../../incidentsApi";
import StatusBadge from "./StatusBadge";

function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const [openIncident, setOpenIncident] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load incidents and their history from Django.
   */
  useEffect(() => {
    const loadIncidentHistory = async () => {
      try {
        setLoading(true);
        setError("");

        // Get all incidents from the database.
        const incidentData = await fetchIncidents();

        /*
         * Get history for every incident.
         *
         * Example:
         * /api/incidents/1/history/
         * /api/incidents/2/history/
         * /api/incidents/3/history/
         */
        const incidentsWithHistory = await Promise.all(
          incidentData.map(async (incident) => {
            try {
              const history = await fetchIncidentHistory(incident.id);

              return {
                ...incident,
                history,
              };
            } catch (historyError) {
              console.error(
                `Failed to load history for incident ${incident.id}:`,
                historyError,
              );

              return {
                ...incident,
                history: [],
              };
            }
          }),
        );

        setIncidents(incidentsWithHistory);
      } catch (err) {
        console.error("Failed to load incident history:", err);

        setError(err.message || "Failed to load incident history.");
      } finally {
        setLoading(false);
      }
    };

    loadIncidentHistory();
  }, []);

  /*
   * Format Django datetime values for display.
   *
   * Example:
   * 2026-09-16T10:42:00Z
   *
   * becomes:
   * Sep 16, 2026, 10:42 AM
   */
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
   * Filter incidents according to the search field.
   */
  const filteredIncidents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return incidents;
    }

    return incidents.filter((incident) => {
      const truckId = String(incident.truck_id || "").toLowerCase();

      const location = String(incident.location || "").toLowerCase();

      const description = String(incident.description || "").toLowerCase();

      const status = String(incident.status || "").toLowerCase();

      const assistanceName = String(
        incident.assigned_assistance_contact?.name || "",
      ).toLowerCase();

      return (
        truckId.includes(searchValue) ||
        location.includes(searchValue) ||
        description.includes(searchValue) ||
        status.includes(searchValue) ||
        assistanceName.includes(searchValue)
      );
    });
  }, [incidents, search]);

  /*
   * Open/close an incident.
   */
  const toggleIncident = (id) => {
    setOpenIncident((currentId) => (currentId === id ? null : id));
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="page history-page">
        <HistoryHeader />

        <div className="card state">
          <p className="state-title">Loading incident history...</p>
          <p>Please wait while the incidents are loaded.</p>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className="page history-page">
        <HistoryHeader />

        <div className="card state" role="alert">
          <p className="state-title">Unable to load incidents</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /*
   * The open incident's details, shown below the table as on the
   * dashboard. Taken from the filtered list, so (as before) an incident
   * the search hides is not shown.
   */
  const openDetails = filteredIncidents.find(
    (incident) => incident.id === openIncident,
  );

  return (
    <div className="page history-page">
      <HistoryHeader />

      <div className="incident-management">
        {/* =========================
            SEARCH
           ========================= */}

        <div className="history-toolbar">
          <div className="field history-search">
            <label className="field-label" htmlFor="history-search">
              Search incidents
            </label>

            <input
              id="history-search"
              className="input"
              type="text"
              placeholder="Search by truck, location, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* =========================
            INCIDENT TABLE
           ========================= */}

        <div className="card incident-table-container">
          <div className="card-header">
            <div>
              <h2 className="card-title">Incidents</h2>

              <p className="card-subtitle">
                Select an incident to view its details and events.
              </p>
            </div>

            <span className="incident-count">
              {incidents.length} {incidents.length === 1 ? "incident" : "incidents"}
            </span>
          </div>

          {filteredIncidents.length > 0 ? (
            <div className="table-scroll">
              <table className="table incident-table">
                <thead>
                  <tr>
                    <th>Reported</th>
                    <th>Truck ID</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncidents.map((incident) => {
                    const isOpen = openIncident === incident.id;

                    return (
                      <tr
                        key={incident.id}
                        onClick={() => toggleIncident(incident.id)}
                        className={isOpen ? "selected-row" : undefined}
                      >
                        <td className="cell-muted cell-nowrap">
                          {formatDate(incident.created_at)}
                        </td>

                        <td className="cell-strong">
                          <span className="cell-truncate" title={incident.truck_id}>
                            {incident.truck_id}
                          </span>
                        </td>

                        <td>
                          <span className="cell-truncate" title={incident.location}>
                            {incident.location}
                          </span>
                        </td>

                        <td>
                          <StatusBadge status={incident.status} />
                        </td>

                        <td>
                          {/* No handler of its own: the click bubbles to the
                              row, which opens and closes the details. This
                              makes that action visible and reachable by
                              keyboard. */}
                          <button
                            type="button"
                            className="table-link"
                            aria-expanded={isOpen}
                          >
                            View
                            <span aria-hidden="true">&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* =========================
               EMPTY RESULT
               ========================= */
            <div className="state">
              <p className="state-title">
                {incidents.length === 0
                  ? "No incidents found"
                  : "No matching incidents"}
              </p>

              <p>
                {incidents.length === 0
                  ? "There are no incidents in the database yet."
                  : "Try another search."}
              </p>
            </div>
          )}
        </div>

        {/* =========================
            INCIDENT DETAILS
           ========================= */}

        {openDetails && (
          <div className="card incident-details">
            <div className="details-header">
              <div>
                <span className="details-label">Selected Incident</span>

                <h2>Incident #{openDetails.id}</h2>
              </div>

              <button
                type="button"
                className="btn btn-secondary close-button"
                onClick={() => toggleIncident(openDetails.id)}
                aria-label="Close incident details"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>Truck ID</span>
                <strong>{openDetails.truck_id || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Location</span>
                <strong>{openDetails.location || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Status</span>
                <StatusBadge status={openDetails.status} />
              </div>

              <div className="detail-item">
                <span>Reported</span>
                <strong>{formatDate(openDetails.created_at)}</strong>
              </div>

              <div className="detail-item">
                <span>Updated</span>
                <strong>{formatDate(openDetails.updated_at)}</strong>
              </div>

              <div className="detail-item full-width">
                <span>Description</span>
                <strong>
                  {openDetails.description || "No description available."}
                </strong>
              </div>
            </div>

            {/* Assistance Contact */}

            <div className="control-section">
              <h3>Assigned Assistance</h3>

              {openDetails.assigned_assistance_contact ? (
                <div className="current-assignment">
                  <strong>{openDetails.assigned_assistance_contact.name}</strong>

                  <span>
                    Phone:{" "}
                    {openDetails.assistance_contact_phone ||
                      openDetails.assigned_assistance_contact.phone ||
                      "—"}
                  </span>

                  <span>
                    Email: {openDetails.assigned_assistance_contact.email || "—"}
                  </span>
                </div>
              ) : (
                <p>No assistance contact assigned.</p>
              )}
            </div>

            {/* Incident History */}

            <div className="control-section">
              <h3>Incident Events</h3>

              {(openDetails.history || []).length > 0 ? (
                <ol className="history-timeline">
                  {openDetails.history.map((event) => (
                    <li className="history-event" key={event.id}>
                      <span className="history-event-marker" aria-hidden="true" />

                      <div className="history-event-content">
                        <strong className="history-event-type">
                          {String(event.event_type || "").replaceAll("_", " ")}
                        </strong>

                        <p>{event.details || "No event details available."}</p>

                        <span className="history-event-time">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No history events recorded for this incident.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Page title and subtitle, the same in the loading, error and loaded views. */
function HistoryHeader() {
  return (
    <header className="page-header">
      <h1 className="page-title">Incident History</h1>

      <p className="page-subtitle">
        View the complete history of previously reported incidents.
      </p>
    </header>
  );
}

export default IncidentHistory;
