import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import Brand from "../../components/Brand";
import { LOGIN_FIELDS, toLoginPayload, validateLogin } from "./loginValidation";
import "./LoginPage.css";

/**
 * The login screen (TIR-61). Presentational only: it validates the form
 * and reports what was entered. It makes no request and holds no auth
 * state -- the caller owns both.
 *
 * Props:
 *   onSubmit({ identifier, password })  Called only when validation
 *                                       passes. identifier is trimmed.
 *   loading  (boolean)  A request is in flight: the submit button is
 *                       disabled and further submits are ignored.
 *   error    (string | null)  Server message, shown in a banner above
 *                             the fields.
 */

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

function LoginPage({ onSubmit, loading = false, error = null }) {
  const [values, setValues] = useState({ identifier: "", password: "" });
  // Field name -> message, invalid fields only.
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));

    // Editing a field clears its message; it is checked again on submit.
    setFieldErrors((current) => {
      if (!(name in current)) return current;

      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading) return;

    const errors = validateLogin(values);
    setFieldErrors(errors);

    const firstInvalid = LOGIN_FIELDS.find((name) => errors[name]);
    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid].focus();
      return;
    }

    onSubmit(toLoginPayload(values));
  };

  return (
    <main className="login">
      <div className="card login-card">
        <div className="login-brand">
          <Brand />
        </div>

        <div className="login-body">
          <header>
            <h1 className="page-title">Sign in</h1>

            <p className="page-subtitle">Enter your details to continue.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="alert alert-error" role="alert">
                {error}
              </p>
            )}

            <div className="field">
              <label className="field-label" htmlFor="login-identifier">
                Username or email
              </label>

              <input
                className="input"
                id="login-identifier"
                name="identifier"
                type="text"
                value={values.identifier}
                onChange={handleChange}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={fieldErrors.identifier ? "true" : undefined}
                aria-describedby={
                  fieldErrors.identifier ? "login-identifier-error" : undefined
                }
                required
              />

              <FieldError
                id="login-identifier-error"
                message={fieldErrors.identifier}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">
                Password
              </label>

              <div className="login-password">
                <input
                  className="input"
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                  aria-describedby={
                    fieldErrors.password ? "login-password-error" : undefined
                  }
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-controls="login-password"
                >
                  {showPassword ? (
                    <EyeOff size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>
              </div>

              <FieldError
                id="login-password-error"
                message={fieldErrors.password}
              />
            </div>

            <button
              className="btn btn-primary login-submit"
              type="submit"
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-switch">
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
