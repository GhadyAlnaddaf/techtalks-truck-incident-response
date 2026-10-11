import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { registerUser } from "./registerApi";
import {
  DEPENDENT_FIELDS,
  REGISTER_FIELDS,
  toRegisterPayload,
  validateRegister,
  validateRegisterField,
} from "./registerValidation";
import "./RegisterForm.css";

/**
 * The registration screen (TIR-65). Anyone who signs up here becomes a
 * Truck Driver: there is no role field, and no role is sent. The server
 * assigns it.
 */

const createInitialValues = () => ({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

/**
 * Always rendered, so its line of height is reserved and a message
 * appearing never pushes the fields below it down -- the same pattern as
 * the incident form.
 */
function FieldError({ id, message }) {
  return (
    <p className="field-error field-error-line" id={id}>
      {message && (
        <>
          <span className="visually-hidden">Error: </span>
          {message}
        </>
      )}
    </p>
  );
}

function RegisterForm() {
  const [values, setValues] = useState(createInitialValues);
  // Field name -> message, invalid fields only.
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const errorRef = useRef(null);
  const doneHeadingRef = useRef(null);

  // The banner sits above the fields and the submit button below them, so
  // on a phone it can appear off screen.
  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [error]);

  // The form the user was in is gone, so put focus on what replaced it.
  useEffect(() => {
    if (registered) {
      doneHeadingRef.current?.focus();
    }
  }, [registered]);

  /** Re-runs the checks for the named fields against the given values. */
  const revalidate = (names, nextValues) => {
    setFieldErrors((current) => {
      const next = { ...current };

      for (const name of names) {
        const message = validateRegisterField(name, nextValues);

        if (message) {
          next[name] = message;
        } else {
          delete next[name];
        }
      }

      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };

    setValues(nextValues);

    // A field already showing an error re-checks on every keystroke, so the
    // message clears as soon as it is fixed. So does a field that depends
    // on this one. New errors wait for blur.
    revalidate(
      [name, ...DEPENDENT_FIELDS[name]].filter((field) => fieldErrors[field]),
      nextValues,
    );

    setError("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    // A dependent field is only judged once it has something in it:
    // leaving the password must not flag an untouched confirmation.
    revalidate(
      [name, ...DEPENDENT_FIELDS[name].filter((field) => values[field] !== "")],
      values,
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    const errors = validateRegister(values);

    setFieldErrors(errors);

    const firstInvalid = REGISTER_FIELDS.find((name) => errors[name]);

    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid].focus();

      return;
    }

    setSubmitting(true);

    try {
      await registerUser(toRegisterPayload(values));

      // TODO (TIR-65): the success response shape is not confirmed yet.
      // registerUser resolves with the parsed body. Once the backend says
      // what is in it, handle it here -- keep the token or user it returns,
      // or redirect -- instead of only pointing to the login page.

      // Clears the passwords out of memory along with everything else.
      setValues(createInitialValues());
      setRegistered(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <main className="register">
        <div className="card register-card register-done">
          <h1 className="page-title" ref={doneHeadingRef} tabIndex={-1}>
            Account created
          </h1>

          <p className="alert alert-success">
            Your account is ready. You can sign in now.
          </p>

          <Link className="btn btn-primary register-submit" to="/login">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="register">
      <div className="card register-card">
        <header className="page-header">
          <h1 className="page-title">Create an account</h1>

          <p className="page-subtitle">Enter your details to get started.</p>
        </header>

        {error && (
          <p
            className="alert alert-error register-error"
            role="alert"
            ref={errorRef}
          >
            {error}
          </p>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="register-username">
              Username
            </label>

            <input
              className="input"
              id="register-username"
              name="username"
              type="text"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={fieldErrors.username ? "true" : undefined}
              aria-describedby={
                fieldErrors.username ? "register-username-error" : undefined
              }
              required
            />

            <FieldError
              id="register-username-error"
              message={fieldErrors.username}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="register-email">
              Email
            </label>

            <input
              className="input"
              id="register-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={fieldErrors.email ? "true" : undefined}
              aria-describedby={
                fieldErrors.email ? "register-email-error" : undefined
              }
              required
            />

            <FieldError id="register-email-error" message={fieldErrors.email} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="register-password">
              Password
            </label>

            <input
              className="input"
              id="register-password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? "true" : undefined}
              aria-describedby={
                fieldErrors.password
                  ? "register-password-hint register-password-error"
                  : "register-password-hint"
              }
              required
            />

            <p className="field-hint" id="register-password-hint">
              At least 8 characters, and not only numbers.
            </p>

            <FieldError
              id="register-password-error"
              message={fieldErrors.password}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="register-confirm-password">
              Confirm password
            </label>

            <input
              className="input"
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              aria-invalid={fieldErrors.confirmPassword ? "true" : undefined}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
              required
            />

            <FieldError
              id="register-confirm-password-error"
              message={fieldErrors.confirmPassword}
            />
          </div>

          <p className="register-note" id="register-role-note">
            New accounts are registered as Truck Drivers.
          </p>

          <button
            className="btn btn-primary register-submit"
            type="submit"
            disabled={submitting}
            aria-busy={submitting || undefined}
            aria-describedby="register-role-note"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="register-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterForm;
