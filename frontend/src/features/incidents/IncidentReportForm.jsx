import { useState } from 'react'
import './IncidentReportForm.css'

const REQUIRED_FIELDS = ['truck_id', 'location', 'description']

const createInitialValues = () => ({
  truck_id: '',
  location: '',
  description: '',
})

function IncidentReportForm() {
  const [values, setValues] = useState(createInitialValues)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  const canSubmit = REQUIRED_FIELDS.every(
    (field) => values[field].trim() !== '',
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canSubmit || submitting) return

    const payload = {
      truck_id: values.truck_id.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
    }

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/incidents/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()

      console.log('API response:', data)

      if (!response.ok) {
        setError(data.message || 'Failed to create incident.')
        return
      }

      setMessage('Incident reported successfully!')

      // Clear the form after successful submission
      setValues(createInitialValues())
    } catch (error) {
      console.error('Error connecting to the API:', error)

      setError(
        'Could not connect to the server. Make sure Django is running.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="incident-form-page">
      <form className="incident-form" onSubmit={handleSubmit}>
        <header className="incident-form-header">
          <h1 className="incident-form-title">
            Report an incident
          </h1>

          <p className="incident-form-subtitle">
            Fill in what you can. A dispatcher will pick this up.
          </p>
        </header>

        <div className="incident-form-field">
          <label
            className="incident-form-label"
            htmlFor="truck_id"
          >
            Truck ID
            <span
              className="incident-form-required"
              aria-hidden="true"
            >
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
          <label
            className="incident-form-label"
            htmlFor="location"
          >
            Location
            <span
              className="incident-form-required"
              aria-hidden="true"
            >
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

          <p
            className="incident-form-hint"
            id="location_hint"
          >
            Road, exit, landmark, or nearest town.
          </p>
        </div>

        <div className="incident-form-field">
          <label
            className="incident-form-label"
            htmlFor="description"
          >
            What happened
            <span
              className="incident-form-required"
              aria-hidden="true"
            >
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

        <button
          className="incident-form-submit"
          type="submit"
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit report'}
        </button>

        {message && (
          <p className="incident-form-success">
            {message}
          </p>
        )}

        {error && (
          <p className="incident-form-error">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

export default IncidentReportForm