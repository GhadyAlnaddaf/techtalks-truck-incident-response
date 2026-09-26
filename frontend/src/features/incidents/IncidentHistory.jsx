import { useState } from "react";
import "./IncidentHistory.css";

/* =========================
   MOCK DATA ONLY
   Based on Django models
   ========================= */

const mockHistory = [
  {
    id: 1,

    // Incident fields
    truck_id: "#24",
    location: "Zahle, Lebanon",
    description: "The truck reported a flat tire.",
    status: "Resolved",
    created_at: "Sep 16, 2026 10:42 AM",
    updated_at: "Sep 16, 2026 12:15 PM",

    // AssistanceContact fields
    assigned_assistance_contact: {
      name: "ABC Mechanics",
      phone: "+961 71 234 567",
      email: "abcmechanics@example.com",
    },

    assistance_contact_phone: "+961 71 234 567",

    // IncidentHistory fields
    history: [
      {
        id: 1,
        event_type: "CREATED",
        details: "Incident was reported by the driver.",
        created_at: "Sep 16, 2026 10:42 AM",
      },
      {
        id: 2,
        event_type: "STATUS_CHANGED",
        details: "Status changed from Pending to In Progress.",
        created_at: "Sep 16, 2026 10:50 AM",
      },
      {
        id: 3,
        event_type: "ASSISTANCE_ASSIGNED",
        details: "ABC Mechanics was assigned to the incident.",
        created_at: "Sep 16, 2026 10:55 AM",
      },
      {
        id: 4,
        event_type: "RESOLVED",
        details: "The flat tire was repaired and the incident was resolved.",
        created_at: "Sep 16, 2026 12:15 PM",
      },
    ],
  },

  {
    id: 2,

    truck_id: "#18",
    location: "Beirut, Lebanon",
    description: "The truck engine stopped working.",
    status: "Resolved",
    created_at: "Sep 15, 2026 09:20 AM",
    updated_at: "Sep 15, 2026 11:40 AM",

    assigned_assistance_contact: {
      name: "Roadside Assistance",
      phone: "+961 76 345 678",
      email: "roadside@example.com",
    },

    assistance_contact_phone: "+961 76 345 678",

    history: [
      {
        id: 1,
        event_type: "CREATED",
        details: "Engine failure incident was reported.",
        created_at: "Sep 15, 2026 09:20 AM",
      },
      {
        id: 2,
        event_type: "STATUS_CHANGED",
        details: "Status changed from Pending to In Progress.",
        created_at: "Sep 15, 2026 09:30 AM",
      },
      {
        id: 3,
        event_type: "ASSISTANCE_ASSIGNED",
        details: "Roadside Assistance was assigned.",
        created_at: "Sep 15, 2026 09:35 AM",
      },
      {
        id: 4,
        event_type: "RESOLVED",
        details: "Engine problem was repaired.",
        created_at: "Sep 15, 2026 11:40 AM",
      },
    ],
  },

  {
    id: 3,

    truck_id: "#31",
    location: "Saida, Lebanon",
    description: "Minor traffic accident involving the truck.",
    status: "Resolved",
    created_at: "Sep 14, 2026 02:10 PM",
    updated_at: "Sep 14, 2026 04:30 PM",

    assigned_assistance_contact: {
      name: "Lebanon Recovery",
      phone: "+961 70 456 789",
      email: "recovery@example.com",
    },

    assistance_contact_phone: "+961 70 456 789",

    history: [
      {
        id: 1,
        event_type: "CREATED",
        details: "Accident incident was reported.",
        created_at: "Sep 14, 2026 02:10 PM",
      },
      {
        id: 2,
        event_type: "STATUS_CHANGED",
        details: "Status changed from Pending to In Progress.",
        created_at: "Sep 14, 2026 02:20 PM",
      },
      {
        id: 3,
        event_type: "ASSISTANCE_ASSIGNED",
        details: "Lebanon Recovery was assigned.",
        created_at: "Sep 14, 2026 02:25 PM",
      },
      {
        id: 4,
        event_type: "RESOLVED",
        details: "The accident response was completed.",
        created_at: "Sep 14, 2026 04:30 PM",
      },
    ],
  },
];

function IncidentHistory() {
  const [search, setSearch] = useState("");
  const [openIncident, setOpenIncident] = useState(null);

  const filteredIncidents = mockHistory.filter((incident) => {
    const searchValue = search.toLowerCase();

    return (
      incident.truck_id.toLowerCase().includes(searchValue) ||
      incident.location.toLowerCase().includes(searchValue) ||
      incident.description.toLowerCase().includes(searchValue) ||
      incident.status.toLowerCase().includes(searchValue) ||
      incident.assigned_assistance_contact?.name
        .toLowerCase()
        .includes(searchValue)
    );
  });

  const toggleIncident = (id) => {
    setOpenIncident(openIncident === id ? null : id);
  };

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

        <div className="history-total">{mockHistory.length} Incidents</div>
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

          return (
            <div className="history-card" key={incident.id}>
              {/* =========================
                  CARD HEADER
                 ========================= */}

              <button
                className="history-card-header"
                onClick={() => toggleIncident(incident.id)}
              >
                <div className="history-card-main">
                  <div className="history-incident-icon">
                    {incident.truck_id.replace("#", "")}
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
                  <strong>{incident.truck_id}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{incident.location}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{incident.status}</strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>{incident.created_at}</strong>
                </div>

                <div>
                  <span>Updated</span>
                  <strong>{incident.updated_at}</strong>
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

                    <p>{incident.description}</p>
                  </div>

                  {/* Assistance Contact */}

                  <div className="history-assistance">
                    <h3>Assigned Assistance</h3>

                    <p>
                      <strong>
                        {incident.assigned_assistance_contact.name}
                      </strong>
                    </p>

                    <p>Phone: {incident.assistance_contact_phone}</p>

                    <p>Email: {incident.assigned_assistance_contact.email}</p>
                  </div>

                  {/* Incident History */}

                  <div className="history-events">
                    <h3>Incident Events</h3>

                    {incident.history.map((event) => (
                      <div className="history-event" key={event.id}>
                        <div className="history-event-marker">●</div>

                        <div className="history-event-content">
                          <strong>
                            {event.event_type.replaceAll("_", " ")}
                          </strong>

                          <p>{event.details}</p>

                          <span>{event.created_at}</span>
                        </div>
                      </div>
                    ))}
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
            <h2>No incidents found</h2>
            <p>Try another search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentHistory;
