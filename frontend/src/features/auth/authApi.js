const API_URL = "http://127.0.0.1:8000/api";

export async function getCsrfToken() {
  const response = await fetch(`${API_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to initialize CSRF protection");
  }

  return data.csrfToken;
}

export async function loginUser(identifier, password) {
  const csrfToken = await getCsrfToken();

  console.log("CSRF token exists:", !!csrfToken);

  if (!csrfToken) {
    throw new Error("CSRF token not received");
  }

  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data.user;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get current user");
  }

  return data.user;
}

export async function logoutUser() {
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    throw new Error("CSRF token not received");
  }

  const response = await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
}
