import { useEffect, useMemo, useState } from "react";
import "./IncidentHistory.css";

import { fetchIncidents, fetchIncidentHistory } from "../../incidentsApi";

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
      <div className="history-page">
        <div className="history-page-header">
          <div>
            <h1>Incident History</h1>
            <p>View the complete history of previously reported incidents.</p>
          </div>
        </div>

        <div className="history-empty">
          <h2>Loading incident history...</h2>
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
      <div className="history-page">
        <div className="history-page-header">
          <div>
            <h1>Incident History</h1>
            <p>View the complete history of previously reported incidents.</p>
          </div>
        </div>

        <div className="history-empty">
          <h2>Unable to load incidents</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* =========================
          HEADER
         ========================= */}

      <div className="history-page-header">
        <div>
          <h1>Incident History</h1>

          <p>View the complete history of previously reported incidents.</p>
        </div>

        <div className="history-total">
          {incidents.length} {incidents.length === 1 ? "Incident" : "Incidents"}
        </div>
      </div>

      {/* =========================
          SEARCH
         ========================= */}

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search by truck, location, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =========================
          INCIDENT LIST
         ========================= */}

      <div className="history-list">
        {filteredIncidents.map((incident) => {
          const isOpen = openIncident === incident.id;

          const assistanceContact = incident.assigned_assistance_contact;

          const history = incident.history || [];

          return (
            <div className="history-card" key={incident.id}>
              {/* =========================
                  CARD HEADER
                 ========================= */}

              <button
                type="button"
                className="history-card-header"
                onClick={() => toggleIncident(incident.id)}
              >
                <div className="history-card-main">
                  <div className="history-incident-icon">
                    {String(incident.truck_id || "").replace("#", "")}
                  </div>

                  <div className="history-id-row">
                    <h2>
                      Truck {incident.truck_id}
                      <span className="history-resolved-badge">
                        {incident.status}
                      </span>
                    </h2>

                    <p>{incident.location}</p>
                  </div>
                </div>

                <div className="history-card-arrow">{isOpen ? "▲" : "▼"}</div>
              </button>

              {/* =========================
                  BASIC INCIDENT INFORMATION
                 ========================= */}

              <div className="history-details">
                <div>
                  <span>Truck ID</span>
                  <strong>{incident.truck_id || "—"}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{incident.location || "—"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{incident.status || "—"}</strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>{formatDate(incident.created_at)}</strong>
                </div>

                <div>
                  <span>Updated</span>
                  <strong>{formatDate(incident.updated_at)}</strong>
                </div>
              </div>

              {/* =========================
                  EXPANDED INFORMATION
                 ========================= */}

              {isOpen && (
                <div className="history-expanded">
                  {/* Description */}

                  <div className="history-description">
                    <h3>Description</h3>

                    <p>{incident.description || "No description available."}</p>
                  </div>

                  {/* Assistance Contact */}

                  <div className="history-assistance">
                    <h3>Assigned Assistance</h3>

                    {assistanceContact ? (
                      <>
                        <p>
                          <strong>{assistanceContact.name}</strong>
                        </p>

                        <p>
                          Phone:{" "}
                          {incident.assistance_contact_phone ||
                            assistanceContact.phone ||
                            "—"}
                        </p>

                        <p>Email: {assistanceContact.email || "—"}</p>
                      </>
                    ) : (
                      <p>No assistance contact assigned.</p>
                    )}
                  </div>

                  {/* Incident History */}

                  <div className="history-events">
                    <h3>Incident Events</h3>

                    {history.length > 0 ? (
                      history.map((event) => (
                        <div className="history-event" key={event.id}>
                          <div className="history-event-marker">●</div>

                          <div className="history-event-content">
                            <strong>
                              {String(event.event_type || "").replaceAll(
                                "_",
                                " ",
                              )}
                            </strong>

                            <p>
                              {event.details || "No event details available."}
                            </p>

                            <span>{formatDate(event.created_at)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No history events recorded for this incident.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* =========================
            EMPTY RESULT
           ========================= */}

        {filteredIncidents.length === 0 && (
          <div className="history-empty">
            <h2>
              {incidents.length === 0
                ? "No incidents found"
                : "No matching incidents"}
            </h2>

            <p>
              {incidents.length === 0
                ? "There are no incidents in the database yet."
                : "Try another search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentHistory;
