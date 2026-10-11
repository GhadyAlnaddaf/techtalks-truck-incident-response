/**
 * Client-side checks for the registration form (TIR-65).
 *
 * Pure on purpose: no React, no DOM, so `npm test` runs it under Node.
 * The errors have the same shape as the incident form's validateAll:
 * field name -> message, invalid fields only.
 *
 * The password rules follow AUTH_PASSWORD_VALIDATORS in
 * backend/config/settings.py closely enough to catch the common mistakes
 * before a round trip. The server still has the final say: its common
 * password list, for one, is not copied here.
 */

/** In DOM order, so the first invalid one found is the one to focus. */
export const REGISTER_FIELDS = [
  "username",
  "email",
  "password",
  "confirmPassword",
];

/**
 * Fields whose message depends on another field: the password is checked
 * against the username and the email, the confirmation against the
 * password. Editing the key can change the verdict on the fields listed.
 */
export const DEPENDENT_FIELDS = {
  username: ["password"],
  email: ["password"],
  password: ["confirmPassword"],
  confirmPassword: [],
};

export const MIN_PASSWORD_LENGTH = 8;

/** Deliberately loose: something@something.something, no spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asString = (value) => (typeof value === "string" ? value : "");

/** The part of an email before the @, or "" when there is none yet. */
const emailName = (email) => {
  const at = email.indexOf("@");

  return at > 0 ? email.slice(0, at) : "";
};

// An empty needle is "contained" in every string, so it never counts.
const containsIgnoringCase = (text, needle) =>
  needle !== "" && text.toLowerCase().includes(needle.toLowerCase());

const validatePassword = (password, username, email) => {
  // Not trimmed: spaces can be part of a real password.
  if (password === "") {
    return "Enter a password.";
  }

  // Spreading counts code points, which is what Python's len() counts on
  // the server. String.length counts UTF-16 units, so an emoji would
  // count twice.
  if ([...password].length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (/^\d+$/.test(password)) {
    return "Password cannot be only numbers.";
  }

  if (containsIgnoringCase(password, username)) {
    return "Password cannot contain your username.";
  }

  if (containsIgnoringCase(password, emailName(email))) {
    return "Password cannot contain the part of your email before the @.";
  }

  return "";
};

/**
 * Takes all the values, not just the field's own, because the password
 * and its confirmation are checked against other fields.
 *
 * @param {string} name - One of REGISTER_FIELDS.
 * @param {Record<string, string>} values
 * @returns {string} The message to show, or "" when the field is valid.
 */
export function validateRegisterField(name, values) {
  const username = asString(values?.username).trim();
  const email = asString(values?.email).trim();
  const password = asString(values?.password);
  const confirmPassword = asString(values?.confirmPassword);

  switch (name) {
    case "username":
      return username === "" ? "Enter a username." : "";

    case "email":
      if (email === "") {
        return "Enter your email address.";
      }

      return EMAIL_PATTERN.test(email) ? "" : "Enter a valid email address.";

    case "password":
      return validatePassword(password, username, email);

    case "confirmPassword":
      if (confirmPassword === "") {
        return "Confirm your password.";
      }

      return confirmPassword === password ? "" : "Passwords do not match.";

    default:
      return "";
  }
}

/**
 * Validates every field.
 *
 * @returns {Record<string, string>} Field name -> message.
 */
export function validateRegister(values) {
  const errors = {};

  for (const name of REGISTER_FIELDS) {
    const message = validateRegisterField(name, values);

    if (message) {
      errors[name] = message;
    }
  }

  return errors;
}

/**
 * What is sent to the backend once validation passes: these three keys
 * and nothing else. The confirmation never leaves the browser, and there
 * is no role, because the server decides that. The username and email
 * are trimmed; the password is passed through exactly as typed.
 *
 * @returns {{ username: string, email: string, password: string }}
 */
export function toRegisterPayload(values) {
  return {
    username: asString(values?.username).trim(),
    email: asString(values?.email).trim(),
    password: asString(values?.password),
  };
}
