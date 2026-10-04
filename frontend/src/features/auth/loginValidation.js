/**
 * Client-side checks for the login form (TIR-61).
 *
 * Pure on purpose: no React, no DOM, so `npm test` runs it under Node.
 * The errors have the same shape as the incident form's validateAll:
 * field name -> message, invalid fields only.
 *
 * Deliberately light. Login accepts a username or an email, so there is
 * no email format check, and length rules belong to sign-up, not sign-in.
 * Whether the credentials are right is the server's call.
 */

/** In DOM order, so the first invalid one found is the one to focus. */
export const LOGIN_FIELDS = ["identifier", "password"];

const asString = (value) => (typeof value === "string" ? value : "");

/**
 * @param {{ identifier?: string, password?: string }} values
 * @returns {Record<string, string>} Field name -> message.
 */
export function validateLogin(values) {
  const errors = {};

  if (asString(values?.identifier).trim() === "") {
    errors.identifier = "Enter your username or email.";
  }

  // Not trimmed: spaces can be part of a real password.
  if (asString(values?.password) === "") {
    errors.password = "Enter your password.";
  }

  return errors;
}

/**
 * What the form hands to onSubmit once validation passes. The identifier
 * is trimmed, because a stray space from a phone keyboard is never part
 * of a username; the password is passed through exactly as typed.
 *
 * @returns {{ identifier: string, password: string }}
 */
export function toLoginPayload(values) {
  return {
    identifier: asString(values?.identifier).trim(),
    password: asString(values?.password),
  };
}
