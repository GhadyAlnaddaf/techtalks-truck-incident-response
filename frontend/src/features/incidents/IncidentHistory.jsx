import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import "./IncidentHistory.css";

import {
  fetchResolvedIncidents,
  fetchIncidentHistory,
} from "../../incidentsApi";

import StatusBadge from "./StatusBadge";
import { filterByStatus, getStatusOptions } from "./incidentStatusFilter";
import { formatEventType } from "./formatEventType";

function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openIncident, setOpenIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const detailsRef = useRef(null);
  const detailsHeadingRef = useRef(null);
  const viewButtonsRef = useRef(new Map());
  const lastOpenRef = useRef(null);

  /*
   * Load only resolved incidents, then load each incident's event history.
   */
  useEffect(() => {
    let cancelled = false;

    const loadIncidentHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const incidentData = await fetchResolvedIncidents();

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
                historyError:
                  historyError.message ||
                  "Could not load this incident's events.",
              };
            }
          }),
        );

        if (!cancelled) {
          setIncidents(incidentsWithHistory);
        }
      } catch (err) {
        console.error("Failed to load resolved incidents:", err);

        if (!cancelled) {
          setError(err.message || "Failed to load resolved incidents.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIncidentHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Format Django datetime values for display.
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
   * Search resolved incidents by truck, location, description,
   * status, assistance contact, or reporting user.
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

      const reporterUsername = String(
        incident.reporting_user?.username || "",
      ).toLowerCase();

      const reporterEmail = String(
        incident.reporting_user?.email || "",
      ).toLowerCase();

      return (
        truckId.includes(searchValue) ||
        location.includes(searchValue) ||
        description.includes(searchValue) ||
        status.includes(searchValue) ||
        assistanceName.includes(searchValue) ||
        reporterUsername.includes(searchValue) ||
        reporterEmail.includes(searchValue)
      );
    });
  }, [incidents, search]);

  const toggleIncident = (id) => {
    setOpenIncident((currentId) => (currentId === id ? null : id));
  };

  /*
   * Keep keyboard focus useful when the details panel opens or closes.
   */
  useEffect(() => {
    if (openIncident !== null) {
      detailsRef.current?.scrollIntoView({
        block: "nearest",
      });

      detailsHeadingRef.current?.focus({
        preventScroll: true,
      });
    } else if (lastOpenRef.current !== null) {
      viewButtonsRef.current.get(lastOpenRef.current)?.focus();
    }

    lastOpenRef.current = openIncident;
  }, [openIncident]);

  const visibleIncidents = filterByStatus(filteredIncidents, statusFilter);

  const openDetails = visibleIncidents.find(
    (incident) => incident.id === openIncident,
  );

  if (loading) {
    return (
      <div className="page history-page">
        <HistoryHeader />

        <div className="card state">
          <p className="state-title">Loading resolved incidents...</p>
          <p>Please wait while the history is loaded.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page history-page">
        <HistoryHeader />

        <div className="card state" role="alert">
          <p className="state-title">Unable to load incident history</p>
          <p>{error}</p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page history-page">
      <HistoryHeader />

      <div className="incident-management">
        <div className="history-toolbar">
          <div className="field history-search">
            <label className="field-label" htmlFor="history-search">
              Search incidents
            </label>

            <input
              id="history-search"
              className="input"
              type="text"
              placeholder="Search by truck, location, reporter..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="field history-filter">
            <label className="field-label" htmlFor="history-status">
              Status
            </label>

            <select
              id="history-status"
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>

              {getStatusOptions(incidents).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card incident-table-container">
          <div className="card-header">
            <div>
              <h2 className="card-title">Resolved Incidents</h2>

              <p className="card-subtitle">
                Select an incident to view its details and event timeline.
              </p>
            </div>

            <span className="incident-count">
              {incidents.length}{" "}
              {incidents.length === 1 ? "incident" : "incidents"}
            </span>
          </div>

          {visibleIncidents.length > 0 ? (
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
                  {visibleIncidents.map((incident) => {
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
                          <span
                            className="cell-truncate"
                            title={incident.truck_id}
                          >
                            {incident.truck_id}
                          </span>
                        </td>

                        <td>
                          <span
                            className="cell-truncate"
                            title={incident.location}
                          >
                            {incident.location}
                          </span>
                        </td>

                        <td>
                          <StatusBadge status={incident.status} />
                        </td>

                        <td>
                          <button
                            ref={(button) => {
                              if (button) {
                                viewButtonsRef.current.set(incident.id, button);
                              } else {
                                viewButtonsRef.current.delete(incident.id);
                              }
                            }}
                            type="button"
                            className="table-link"
                            aria-expanded={isOpen}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleIncident(incident.id);
                            }}
                          >
                            View <span aria-hidden="true">&rarr;</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="state">
              <p className="state-title">
                {incidents.length === 0
                  ? "No resolved incidents"
                  : "No matching incidents"}
              </p>

              <p>
                {incidents.length === 0
                  ? "Resolved incidents will appear here."
                  : "Try another search or status."}
              </p>
            </div>
          )}
        </div>

        {openDetails && (
          <div className="card incident-details" ref={detailsRef}>
            <div className="details-header">
              <div>
                <span className="details-label">Selected Incident</span>

                <h2 ref={detailsHeadingRef} tabIndex={-1}>
                  Incident #{openDetails.id}
                </h2>
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
                <span>Last Updated</span>
                <strong>{formatDate(openDetails.updated_at)}</strong>
              </div>

              <div className="detail-item">
                <span>Reporter Username</span>
                <strong>
                  {openDetails.reporting_user?.username || "Unknown"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Reporter Email</span>
                <strong>
                  {openDetails.reporting_user?.email || "Not available"}
                </strong>
              </div>

              <div className="detail-item full-width">
                <span>Description</span>
                <strong>
                  {openDetails.description || "No description available."}
                </strong>
              </div>
            </div>

            <div className="control-section">
              <h3>Assigned Assistance</h3>

              {openDetails.assigned_assistance_contact ? (
                <div className="current-assignment">
                  <strong>
                    {openDetails.assigned_assistance_contact.name}
                  </strong>

                  <span>
                    Phone:{" "}
                    {openDetails.assistance_contact_phone ||
                      openDetails.assigned_assistance_contact.phone ||
                      "—"}
                  </span>

                  <span>
                    Email:{" "}
                    {openDetails.assigned_assistance_contact.email || "—"}
                  </span>
                </div>
              ) : (
                <p>No assistance contact assigned.</p>
              )}
            </div>

            <div className="control-section">
              <h3>Incident Events</h3>

              {openDetails.historyError ? (
                <p className="alert alert-error" role="alert">
                  {openDetails.historyError}
                </p>
              ) : (openDetails.history || []).length > 0 ? (
                <ol className="history-timeline">
                  {openDetails.history.map((event) => (
                    <li className="history-event" key={event.id}>
                      <span
                        className="history-event-marker"
                        aria-hidden="true"
                      />

                      <div className="history-event-content">
                        <strong className="history-event-type">
                          {formatEventType(event.event_type)}
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

function HistoryHeader() {
  return (
    <header className="page-header">
      <h1 className="page-title">Incident History</h1>

      <p className="page-subtitle">
        View the complete history of resolved incidents.
      </p>
    </header>
  );
}

export default IncidentHistory;
