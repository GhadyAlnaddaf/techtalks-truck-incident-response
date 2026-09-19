import { useState } from "react";

import { assignAssistance, updateIncidentStatus } from "./incidentsApi";

import { useIncidentDetails } from "./useIncidentDetails";

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
      <div className="no-incidents">
        <p>No incidents reported yet.</p>
      </div>
    );
  }

  return (
    <div className="incident-management">
      {/* INCIDENT TABLE */}

      <div className="incident-table-container">
        {" "}
        <table className="incident-table">
          {" "}
          <thead>
            {" "}
            <tr>
              {" "}
              <th>Incident</th> <th>Truck ID</th> <th>Location</th>{" "}
              <th>Status</th> <th>Assistance Contact</th>{" "}
              <th>Created At</th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className={
                  selectedIncidentId === incident.id ? "selected-row" : ""
                }
              >
                {" "}
                <td>
                  {" "}
                  <strong>#{incident.id}</strong>{" "}
                </td>{" "}
                <td>{incident.truck_id}</td> <td>{incident.location}</td>{" "}
                <td>
                  {" "}
                  <span className="status"> {incident.status} </span>{" "}
                </td>{" "}
                <td>
                  {" "}
                  {incident.assigned_assistance_contact ? (
                    <strong>
                      {" "}
                      {incident.assigned_assistance_contact.phone}{" "}
                    </strong>
                  ) : (
                    <span>Not assigned</span>
                  )}{" "}
                </td>{" "}
                <td>{incident.created_at}</td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>

      {/* INCIDENT DETAILS */}

      {selectedIncidentId && (
        <div className="incident-details">
          {/* Loading */}

          {detailsState === "loading" && (
            <div className="message-box">
              <p>Loading incident details...</p>
            </div>
          )}

          {/* Error */}

          {detailsState === "error" && (
            <div className="message-box error-message">
              <p>{detailsError}</p>

              <button className="primary-button" onClick={retry}>
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
                  className="close-button"
                  onClick={() => setSelectedIncidentId(null)}
                >
                  ×
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

                  <strong>
                    <span className="status">{selectedIncident.status}</span>
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Created At</span>

                  <strong>{selectedIncident.created_at}</strong>
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
                  <select
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
                    className="primary-button"
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
                  <select
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
                    className="primary-button"
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
                      ? "action-message success-message"
                      : "action-message error-message"
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