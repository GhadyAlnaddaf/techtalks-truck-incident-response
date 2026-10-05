import { getCsrfToken } from "./features/auth/authApi";

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
      data.message || "Something went wrong with the API request.",
    );
  }

  return data;
}

export async function fetchIncidents() {
  const response = await fetch(`${API_URL}/list/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse(response);

  return data.incidents || [];
}

export async function fetchIncidentById(incidentId, options = {}) {
  const response = await fetch(`${API_URL}/${incidentId}/`, {
    ...options,
    credentials: "include",
  });

  return parseResponse(response);
}

export async function createIncident(incident) {
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    throw new Error("CSRF token not received.");
  }

  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(incident),
  });

  const data = await parseResponse(response);

  return data.incident;
}

export async function updateIncidentStatus(incidentId, status) {
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    throw new Error("CSRF token not received.");
  }

  const response = await fetch(`${API_URL}/${incidentId}/status/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      status,
    }),
  });

  const data = await parseResponse(response);

  return data.incident;
}

export async function assignAssistance(incidentId, assistanceContactId) {
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    throw new Error("CSRF token not received.");
  }

  const response = await fetch(`${API_URL}/${incidentId}/assistance/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      assistance_contact_id: Number(assistanceContactId),
    }),
  });

  const data = await parseResponse(response);

  return data.incident;
}

export async function fetchIncidentHistory(incidentId) {
  const response = await fetch(`${API_URL}/${incidentId}/history/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse(response);

  return data.history || [];
}
