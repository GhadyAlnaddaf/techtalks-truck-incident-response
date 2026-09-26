const API_URL = "http://127.0.0.1:8000/api/incidents";

async function parseResponse(response) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong with the API request."
    );
  }

  return data;
}

export async function fetchIncidents() {
  const response = await fetch(`${API_URL}/list/`);

  const data = await parseResponse(response);

  return data.incidents;
}

export async function fetchIncidentById(
  incidentId,
  options = {}
) {
  const response = await fetch(
    `${API_URL}/${incidentId}/`,
    options
  );

  return parseResponse(response);
}

export async function updateIncidentStatus(
  incidentId,
  status
) {
  const response = await fetch(
    `${API_URL}/${incidentId}/status/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await parseResponse(response);

  return data.incident;
}

export async function assignAssistance(
  incidentId,
  assistanceContactId
) {
  const response = await fetch(
    `${API_URL}/${incidentId}/assistance/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistance_contact_id: Number(assistanceContactId),
      }),
    }
  );

  const data = await parseResponse(response);

  return data.incident;
}

/**
 * Fetch the history events for one incident.
 */
export async function fetchIncidentHistory(incidentId) {
  const response = await fetch(
    `${API_URL}/${incidentId}/history/`
  );

  const data = await parseResponse(response);

  return data.history || [];
}