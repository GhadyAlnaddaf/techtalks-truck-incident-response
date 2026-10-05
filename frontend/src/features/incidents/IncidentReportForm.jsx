import { useState } from "react";
import "./IncidentReportForm.css";

import { createIncident } from "../../incidentsApi";

/** In DOM order, so the first invalid one found is the one to focus. */
const REQUIRED_FIELDS = ["truck_id", "location", "description"];

/**
 * Mirrors the backend Incident model:
 * truck_id and location are CharField(max_length=255),
 * description is a TextField with no limit.
 */
const FIELD_RULES = {
  truck_id: {
    label: "Truck ID",
    requiredMessage: "Enter the truck ID",
    maxLength: 255,
  },

  location: {
    label: "Location",
    requiredMessage: "Enter the location",
    maxLength: 255,
  },

  description: {
    requiredMessage: "Describe what happened",
  },
};

const createInitialValues = () => ({
  truck_id: "",
  location: "",
  description: "",
});

/**
 * Returns the message to show for a field,
 * or an empty string when it is valid.
 */
const validateField = (name, value) => {
  const { label, requiredMessage, maxLength } = FIELD_RULES[name];

  const trimmed = value.trim();

  if (trimmed === "") {
    return requiredMessage;
  }

  if (maxLength && [...trimmed].length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer`;
  }

  return "";
};

/**
 * Validates every field.
 */
const validateAll = (values) => {
  const errors = {};

  for (const name of REQUIRED_FIELDS) {
    const message = validateField(name, values[name]);

    if (message) {
      errors[name] = message;
    }
  }

  return errors;
};

/**
 * Always rendered so its line of height is reserved.
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

function IncidentReportForm() {
  const [values, setValues] = useState(createInitialValues);

  const [fieldErrors, setFieldErrors] = useState({});

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const setFieldError = (name, fieldMessage) => {
    setFieldErrors((current) => {
      if (fieldMessage) {
        return {
          ...current,
          [name]: fieldMessage,
        };
      }

      if (!(name in current)) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[name];

      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldError(name, validateField(name, value));
    }

    setMessage("");
    setError("");
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    setFieldError(name, validateField(name, value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setMessage("");
    setError("");

    const errors = validateAll(values);

    setFieldErrors(errors);

    const firstInvalid = REQUIRED_FIELDS.find((name) => errors[name]);

    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid].focus();

      return;
    }

    const payload = {
      truck_id: values.truck_id.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
    };

    setSubmitting(true);

    try {
      const incident = await createIncident(payload);

      console.log("Incident created:", incident);

      setMessage("Incident reported successfully!");

      setValues(createInitialValues());

      setFieldErrors({});
    } catch (error) {
      console.error("Error creating incident:", error);

      setError(error.message || "Failed to create incident.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Report an Incident</h1>

        <p className="page-subtitle">
          Fill in what you can. A dispatcher will pick this up.
        </p>
      </header>

      <form
        className="card card-padded incident-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="field incident-form-field">
          <label className="field-label" htmlFor="truck_id">
            Truck ID
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>

          <input
            className="input"
            id="truck_id"
            name="truck_id"
            type="text"
            value={values.truck_id}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            aria-invalid={fieldErrors.truck_id ? "true" : undefined}
            aria-describedby={
              fieldErrors.truck_id ? "truck_id_error" : undefined
            }
            required
          />

          <FieldError id="truck_id_error" message={fieldErrors.truck_id} />
        </div>

        <div className="field incident-form-field">
          <label className="field-label" htmlFor="location">
            Location
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>

          <input
            className="input"
            id="location"
            name="location"
            type="text"
            value={values.location}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={fieldErrors.location ? "true" : undefined}
            aria-describedby={
              fieldErrors.location
                ? "location_hint location_error"
                : "location_hint"
            }
            required
          />

          <p className="field-hint" id="location_hint">
            Road, exit, landmark, or nearest town.
          </p>

          <FieldError id="location_error" message={fieldErrors.location} />
        </div>

        <div className="field incident-form-field">
          <label className="field-label" htmlFor="description">
            What happened
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>

          <textarea
            className="input"
            id="description"
            name="description"
            rows="5"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={fieldErrors.description ? "true" : undefined}
            aria-describedby={
              fieldErrors.description ? "description_error" : undefined
            }
            required
          />

          <FieldError
            id="description_error"
            message={fieldErrors.description}
          />
        </div>

        <button
          className="btn btn-primary incident-form-submit"
          type="submit"
          aria-busy={submitting || undefined}
        >
          {submitting ? "Submitting..." : "Submit report"}
        </button>

        {message && <p className="alert alert-success">{message}</p>}

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default IncidentReportForm;
