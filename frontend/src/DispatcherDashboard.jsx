import IncidentList from "./IncidentList";

function DispatcherDashboard() {
  const incidents = [
    {
      id: 1,
      truck_id: "TRUCK-001",
      location: "Saida Highway",
      description: "Truck was involved in a road accident.",
      occurred_at: "2026-09-09T14:30:00",
      status: "Pending",
    },
    {
      id: 2,
      truck_id: "TRUCK-002",
      location: "Beirut",
      description: "Truck experienced a mechanical breakdown.",
      occurred_at: "2026-09-09T15:00:00",
      status: "Pending",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dispatcher Dashboard</h1>
        <p>Monitor reported truck incidents.</p>
      </div>

      <section className="incident-section">
        <h2>Reported Incidents</h2>

        <IncidentList incidents={incidents} />
      </section>
    </div>
  );
}

export default DispatcherDashboard;