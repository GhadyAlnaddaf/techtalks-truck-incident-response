function IncidentList({ incidents }) {
  if (incidents.length === 0) {
    return (
      <div className="no-incidents">
        <p>No incidents reported yet.</p>
      </div>
    );
  }

  return (
    <div className="incident-list">
      {incidents.map((incident) => (
        <div className="incident-card" key={incident.id}>
          <div className="incident-card-header">
            <h3>Incident #{incident.id}</h3>

            <span className="status">
              {incident.status}
            </span>
          </div>

          <p>
            <strong>Truck ID:</strong> {incident.truck_id}
          </p>

          <p>
            <strong>Location:</strong> {incident.location}
          </p>

          <p>
            <strong>Description:</strong> {incident.description}
          </p>

          <p>
            <strong>Created At:</strong> {incident.created_at}
          </p>
        </div>
      ))}
    </div>
  );
}

export default IncidentList;