import { useState } from 'react'
import './IncidentReportForm.css'

/** Fields that gate the submit button. */
const REQUIRED_FIELDS = ['truck_id', 'location', 'description', 'occurred_at']

/** Formats a Date as the `YYYY-MM-DDTHH:mm` that datetime-local expects. */
function toLocalInputValue(date) {
  const pad = (value) => String(value).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Converts the browser's local `datetime-local` string to a UTC ISO 8601
 * timestamp for DRF. The driver enters wall-clock time where they are standing;
 * the backend receives an unambiguous instant.
 */
function toIso8601(localValue) {
  if (!localValue) return null
  const date = new Date(localValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

// Defaults the incident time to now -- a driver reporting from the roadside is
// almost always reporting something that just happened. Still fully editable.
const createInitialValues = () => ({
  truck_id: '',
  location: '',
  description: '',
  occurred_at: toLocalInputValue(new Date()),
})

function IncidentReportForm() {
  const [values, setValues] = useState(createInitialValues)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const canSubmit = REQUIRED_FIELDS.every(
    (field) => values[field].trim() !== '',
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    // The button is disabled in this state, but keyboard and native form
    // submission paths can still reach here. Exit rather than send junk.
    if (!canSubmit) return

    // status, created_at and updated_at are server-owned and never sent.
    const payload = {
      truck_id: values.truck_id.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
      // Depends on the backend adding an `occurred_at` column to the Incident
      // model -- requested, not yet merged. Until then the API will reject or
      // ignore this key.
      occurred_at: toIso8601(values.occurred_at),
    }

    // TIR-32 stops here. The POST lands in a later ticket.
    console.log('Incident report payload:', payload)
  }

  return (
    <div className="incident-form-page">
      <form className="incident-form" onSubmit={handleSubmit}>
        <header className="incident-form-header">
          <h1 className="incident-form-title">Report an incident</h1>
          <p className="incident-form-subtitle">
            Fill in what you can. A dispatcher will pick this up.
          </p>
        </header>

        <div className="incident-form-field">
          <label className="incident-form-label" htmlFor="truck_id">
            Truck ID
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="incident-form-input"
            id="truck_id"
            name="truck_id"
            type="text"
            value={values.truck_id}
            onChange={handleChange}
            maxLength={255}
            autoComplete="off"
            required
          />
        </div>

        <div className="incident-form-field">
          <label className="incident-form-label" htmlFor="location">
            Location
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="incident-form-input"
            id="location"
            name="location"
            type="text"
            value={values.location}
            onChange={handleChange}
            maxLength={255}
            aria-describedby="location_hint"
            required
          />
          <p className="incident-form-hint" id="location_hint">
            Road, exit, landmark, or nearest town.
          </p>
        </div>

        <div className="incident-form-field">
          <label className="incident-form-label" htmlFor="description">
            What happened
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            className="incident-form-input incident-form-textarea"
            id="description"
            name="description"
            rows="5"
            value={values.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="incident-form-field">
          <label className="incident-form-label" htmlFor="occurred_at">
            Date and time
            <span className="incident-form-required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="incident-form-input"
            id="occurred_at"
            name="occurred_at"
            type="datetime-local"
            value={values.occurred_at}
            onChange={handleChange}
            required
          />
        </div>

        <button
          className="incident-form-submit"
          type="submit"
          disabled={!canSubmit}
        >
          Submit report
        </button>
      </form>
    </div>
  )
}

export default IncidentReportForm
