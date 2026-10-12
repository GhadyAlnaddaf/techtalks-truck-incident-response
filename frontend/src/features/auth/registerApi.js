
import { getCsrfToken } from "./authApi";

const API_URL = "http://127.0.0.1:8000/api";
const REGISTER_URL = `${API_URL}/auth/register/`;

const FALLBACK_ERROR = "Something went wrong. Please try again.";

export async function registerUser(payload) {
  let response;

  try {
    const csrfToken = await getCsrfToken();

    response = await fetch(REGISTER_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Registration request failed:", error);
    throw new Error(FALLBACK_ERROR, { cause: error });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.message === "string" ? data.message.trim() : "";

    const passwordErrors = Array.isArray(data?.errors)
      ? data.errors.join(" ")
      : "";

    throw new Error(
      [message, passwordErrors].filter(Boolean).join(" ") ||
        FALLBACK_ERROR
    );
  }

  return data;
}
