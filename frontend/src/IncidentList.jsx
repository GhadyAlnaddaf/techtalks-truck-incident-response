import { useState } from "react";
import { X } from "lucide-react";

import { assignAssistance, updateIncidentStatus } from "./incidentsApi";

import StatusBadge from "./features/incidents/StatusBadge";

import { formatDateTime } from "./features/incidents/formatDateTime";

import { useIncidentDetails } from "./useIncidentDetails";

/**
 * The table card's own header. In the mockup the section heading sits
 * inside the white card, above the table, rather than on the page
 * background. Presentational only -- no state, no handlers.
 */
function IncidentsCardHeader({ count }) {
  return (
    <div className="card-header">
      <div>
        <h2 className="card-title">Incidents</h2>

        <p className="card-subtitle">
          Select an incident to view its full details.
        </p>
      </div>

      <span className="incident-count">
        {count} incident
        {count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function IncidentList({ incidents, setIncidents }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const [selectedAssistance, setSelectedAssistance] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  /*
   * Load the full incident from the backend
   * whenever the dispatcher selects an incident.
   */
  const {
    state: detailsState,
    incident: selectedIncident,
    errorMessage: detailsError,
    retry,
  } = useIncidentDetails(selectedIncidentId);

  /*
   * These IDs must match AssistanceContact records
   * in the Django database.
   */
  const assistanceContacts = [
    {
      id: 1,
      name: "John Smith",
    },
    {
      id: 2,
      name: "Sarah Johnson",
    },
    {
      id: 3,
      name: "Mike Wilson",
    },
  ];

  /*
   * These values MUST match VALID_STATUSES
   * in Django exactly.
   */
  const statuses = [
    "Pending",
    "Assigned",
    "On the way",
    "In progress",
    "Resolved",
  ];

  /*
   * User selects an incident from the table.
   */
  const handleIncidentClick = (incident) => {
    setSelectedIncidentId(incident.id);

    setSelectedAssistance(
      incident.assigned_assistance_contact?.id
        ? String(incident.assigned_assistance_contact.id)
        : "",
    );

    setSelectedStatus(incident.status || "");

    setMessage("");
    setMessageType("");
  };

  /*
   * Update assistance through Django API.
   */
  const handleAssign = async () => {
    if (!selectedAssistance) {
      setMessage("Please select an assistance contact.");

      setMessageType("error");

      return;
    }

    if (!selectedIncident) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setMessageType("");

      const updatedIncident = await assignAssistance(
        selectedIncident.id,
        selectedAssistance,
      );

      /*
       * Update the incident in the table.
       */
      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.id === updatedIncident.id ? updatedIncident : incident,
        ),
      );

      /*
       * Keep the selected assistance in sync.
       */
      setSelectedAssistance(
        updatedIncident.assigned_assistance_contact
          ? String(updatedIncident.assigned_assistance_contact.id)
          : "",
      );

      /*
       * Reload the selected incident from Django.
       */
      retry();

      setMessage(
        `Assistance assigned successfully to Incident #${updatedIncident.id}.`,
      );

      setMessageType("success");
    } catch (error) {
      console.error("Failed to assign assistance:", error);

      setMessage(error.message || "Failed to assign assistance.");

      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Update status through Django API.
   */
  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setMessage("Please select a status.");
      setMessageType("error");

      return;
    }

    if (!selectedIncident) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setMessageType("");

      const updatedIncident = await updateIncidentStatus(
        selectedIncident.id,
        selectedStatus,
      );

      /*
       * Update the incident in the table.
       */
      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.id === updatedIncident.id ? updatedIncident : incident,
        ),
      );

      /*
       * Keep the selected status in sync.
       */
      setSelectedStatus(updatedIncident.status);

      /*
       * Reload the selected incident from Django.
       */
      retry();

      setMessage(
        `Incident #${updatedIncident.id} status updated successfully.`,
      );

      setMessageType("success");
    } catch (error) {
      console.error("Failed to update status:", error);

      setMessage(error.message || "Failed to update status.");

      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * No incidents.
   */
  if (incidents.length === 0) {
    return (
      <div className="card">
        <IncidentsCardHeader count={0} />

        <div className="state">
          <p>No incidents reported yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="incident-management">
      {/* INCIDENT TABLE */}

      <div className="card incident-table-container">
        <IncidentsCardHeader count={incidents.length} />

        <div className="table-scroll">
          <table className="table incident-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Truck ID</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assistance Contact</th>
                <th>Reported</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident)}
                  className={
                    selectedIncidentId === incident.id ? "selected-row" : ""
                  }
                >
                  <td className="cell-strong cell-nowrap">#{incident.id}</td>

                  <td>
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
                    {incident.assigned_assistance_contact ? (
                      <span className="cell-strong">
                        {incident.assigned_assistance_contact.phone}
                      </span>
                    ) : (
                      <span className="cell-muted">Not assigned</span>
                    )}
                  </td>

                  <td className="cell-muted cell-nowrap">
                    {formatDateTime(incident.created_at)}
                  </td>

                  <td>
                    {/* No handler of its own: the click bubbles to the row,
                        which is what already selects the incident. This only
                        makes that existing action visible and reachable by
                        keyboard. */}
                    <button type="button" className="table-link">
                      View
                      <span aria-hidden="true">&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INCIDENT DETAILS */}

      {selectedIncidentId && (
        <div className="card incident-details">
          {/* Loading */}

          {detailsState === "loading" && (
            <div className="state">
              <p>Loading incident details...</p>
            </div>
          )}

          {/* Error */}

          {detailsState === "error" && (
            <div className="state">
              <p className="alert alert-error" role="alert">
                {detailsError}
              </p>

              <button
                className="btn btn-secondary incident-details-retry"
                onClick={retry}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loaded */}

          {detailsState === "loaded" && selectedIncident && (
            <>
              {/* DETAILS HEADER */}

              <div className="details-header">
                <div>
                  <span className="details-label">Selected Incident</span>

                  <h2>Incident #{selectedIncident.id}</h2>
                </div>

                <button
                  className="btn btn-secondary close-button"
                  onClick={() => setSelectedIncidentId(null)}
                  aria-label="Close incident details"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* INCIDENT INFORMATION */}

              <div className="details-grid">
                <div className="detail-item">
                  <span>Incident ID</span>

                  <strong>#{selectedIncident.id}</strong>
                </div>

                <div className="detail-item">
                  <span>Truck ID</span>

                  <strong>{selectedIncident.truck_id}</strong>
                </div>

                <div className="detail-item">
                  <span>Location</span>

                  <strong>{selectedIncident.location}</strong>
                </div>

                <div className="detail-item">
                  <span>Current Status</span>

                  <StatusBadge status={selectedIncident.status} />
                </div>

                <div className="detail-item">
                  <span>Reported</span>

                  <strong>{formatDateTime(selectedIncident.created_at)}</strong>
                </div>

                <div className="detail-item full-width">
                  <span>Description</span>

                  <strong>
                    {selectedIncident.description || "No description provided."}
                  </strong>
                </div>
              </div>

              {/* ASSISTANCE */}

              <div className="control-section">
                <h3>Assistance Assignment</h3>

                <p>Select an available assistance contact for this incident.</p>

                <div className="control-row">
                  {/* Visually hidden: the heading above already says what
                      this is, and a visible label would change the row. */}
                  <label className="visually-hidden" htmlFor="assistance-contact">
                    Assistance contact
                  </label>

                  <select
                    id="assistance-contact"
                    className="input"
                    value={selectedAssistance}
                    onChange={(e) => setSelectedAssistance(e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="">Select assistance</option>

                    {assistanceContacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-primary"
                    onClick={handleAssign}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Assign Assistance"}
                  </button>
                </div>

                <div className="current-assignment">
                  <span>Currently Assigned:</span>

                  <strong>
                    {selectedIncident.assigned_assistance_contact
                      ? `${selectedIncident.assigned_assistance_contact.name} — ${selectedIncident.assigned_assistance_contact.phone}`
                      : "No assistance assigned"}
                  </strong>
                </div>
              </div>

              {/* STATUS */}

              <div className="control-section">
                <h3>Update Incident Status</h3>

                <p>Select the new status for this incident.</p>

                <div className="control-row">
                  <label className="visually-hidden" htmlFor="incident-status">
                    New status
                  </label>

                  <select
                    id="incident-status"
                    className="input"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="">Select status</option>

                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-primary"
                    onClick={handleStatusUpdate}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </div>

              {/* SUCCESS / ERROR */}

              {message && (
                <div
                  className={
                    messageType === "success"
                      ? "alert alert-success action-message"
                      : "alert alert-error action-message"
                  }
                >
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IncidentList;
