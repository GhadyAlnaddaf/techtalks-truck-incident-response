import { useState } from "react";

import IncidentDetails from "./features/incidents/IncidentDetails";

function IncidentList({ incidents, setIncidents }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [selectedAssistance, setSelectedAssistance] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const assistanceContacts = [
    "Ambulance",
    "Police",
    "Towing Service",
    "Road Assistance",
  ];

  const statuses = [
    "Reported",
    "In Progress",
    "Resolved",
    "Cancelled",
  ];

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);

    setSelectedAssistance(incident.assistance || "");
    setSelectedStatus(incident.status || "");

    setMessage("");
    setMessageType("");
  };

  const handleAssign = () => {
    if (!selectedAssistance) {
      setMessage("Please select an assistance contact.");
      setMessageType("error");
      return;
    }

    const updatedIncident = {
      ...selectedIncident,
      assistance: selectedAssistance,
    };

    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === selectedIncident.id
          ? updatedIncident
          : incident
      )
    );

    setSelectedIncident(updatedIncident);

    setMessage(
      `${selectedAssistance} has been assigned to Incident #${selectedIncident.id}.`
    );
    setMessageType("success");
  };

  const handleStatusUpdate = () => {
    if (!selectedStatus) {
      setMessage("Please select a status.");
      setMessageType("error");
      return;
    }

    const updatedIncident = {
      ...selectedIncident,
      status: selectedStatus,
    };

    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === selectedIncident.id
          ? updatedIncident
          : incident
      )
    );

    setSelectedIncident(updatedIncident);

    setMessage(
      `Incident #${selectedIncident.id} status updated to "${selectedStatus}".`
    );
    setMessageType("success");
  };

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
        <table className="incident-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Truck ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className={
                  selectedIncident?.id === incident.id
                    ? "selected-row"
                    : ""
                }
              >
                <td>
                  <strong>#{incident.id}</strong>
                </td>

                <td>{incident.truck_id}</td>

                <td>{incident.location}</td>

                <td>
                  <span className="status">
                    {incident.status}
                  </span>
                </td>

                <td>{incident.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FULL INCIDENT DETAILS */}

      {selectedIncident && (
        <div className="incident-details">

          <div className="details-header">
            <div>
              <span className="details-label">
                Selected Incident
              </span>

              <h2>Incident #{selectedIncident.id}</h2>
            </div>

            <button
              className="close-button"
              onClick={() => setSelectedIncident(null)}
            >
              ×
            </button>
          </div>

          {/* INCIDENT INFORMATION */}

          <IncidentDetails incidentId={selectedIncident.id} />

          {/* ASSISTANCE */}

          <div className="control-section">
            <h3>Assistance Assignment</h3>

            <p>
              Select an available assistance contact for this incident.
            </p>

            <div className="control-row">

              <select
                value={selectedAssistance}
                onChange={(e) =>
                  setSelectedAssistance(e.target.value)
                }
              >
                <option value="">
                  Select assistance
                </option>

                {assistanceContacts.map((contact) => (
                  <option key={contact} value={contact}>
                    {contact}
                  </option>
                ))}
              </select>

              <button
                className="primary-button"
                onClick={handleAssign}
              >
                Assign Assistance
              </button>

            </div>

            <div className="current-assignment">
              <span>Currently Assigned:</span>

              <strong>
                {selectedIncident.assistance ||
                  "No assistance assigned"}
              </strong>
            </div>
          </div>

          {/* STATUS */}

          <div className="control-section">
            <h3>Update Incident Status</h3>

            <p>
              Select the new status for this incident.
            </p>

            <div className="control-row">

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
              >
                <option value="">
                  Select status
                </option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                className="primary-button"
                onClick={handleStatusUpdate}
              >
                Update Status
              </button>

            </div>
          </div>

          {/* SUCCESS / ERROR MESSAGE */}

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

        </div>
      )}
    </div>
  );
}

export default IncidentList;