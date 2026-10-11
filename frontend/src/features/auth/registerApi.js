import { getCsrfToken } from "./authApi";

// TODO confirm with backend
const REGISTER_URL = "/api/register/";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

/**
 * Creates an account (TIR-65). The only place that knows the endpoint.
 *
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<object | null>} The parsed success body, or null when
 *   there is none.
 * @throws {Error} Always with a message that is fit to show the user: the
 *   backend's own { message } when it sends one, a generic line otherwise.
 *   A network failure is reported the same way.
 */
export async function registerUser(payload) {
  let response;

  try {
    // Every other POST to this backend carries the CSRF token, so this one
    // is assumed to need it too. TODO confirm with backend.
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
    console.error("Error connecting to the API:", error);

    throw new Error(FALLBACK_ERROR, { cause: error });
  }

  // An HTML error page (a Django 500, say) is not JSON.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message.trim() : "";

    throw new Error(message || FALLBACK_ERROR);
  }

  return data;
}
