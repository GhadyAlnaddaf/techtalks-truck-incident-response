import './IncidentDetails.css'
import { useIncidentDetails } from './useIncidentDetails'

const NOT_PROVIDED = 'Not provided'

/** Renders driver-submitted text as plain text, with a placeholder for blanks. */
const displayValue = (value) => {
  if (value === null || value === undefined) return NOT_PROVIDED

  const text = typeof value === 'string' ? value.trim() : String(value)

  return text === '' ? NOT_PROVIDED : text
}

/**
 * created_at is an ISO string. Anything the browser cannot parse is shown
 * as it came from the backend rather than as "Invalid Date".
 */
const renderReportedAt = (value) => {
  const raw = typeof value === 'string' ? value.trim() : value

  if (!raw) return NOT_PROVIDED

  const parsed = new Date(raw)

  if (Number.isNaN(parsed.getTime())) return raw

  return (
    <time dateTime={value}>
      {parsed.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}
    </time>
  )
}

/**
 * The details of the selected incident, loaded from the backend.
 *
 * @param {{ incidentId: string|number|null|undefined }} props
 */
function IncidentDetails({ incidentId }) {
  const { state, incident, errorMessage, retry } = useIncidentDetails(incidentId)

  if (state === 'loading') {
    return (
      <div className="message-box incident-details-message" role="status">
        <p>Loading incident details...</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div
        className="message-box error-message incident-details-message"
        role="alert"
      >
        <p>{errorMessage}</p>

        <button
          className="primary-button"
          type="button"
          onClick={retry}
        >
          Try again
        </button>
      </div>
    )
  }

  if (state !== 'loaded' || !incident) return null

  return (
    <dl className="details-grid incident-details-list">

      <div className="detail-item">
        <dt><span>Truck ID</span></dt>
        <dd><strong>{displayValue(incident.truck_id)}</strong></dd>
      </div>

      <div className="detail-item">
        <dt><span>Status</span></dt>
        <dd>
          <strong>
            <span className="status">
              {displayValue(incident.status)}
            </span>
          </strong>
        </dd>
      </div>

      <div className="detail-item">
        <dt><span>Reported</span></dt>
        <dd><strong>{renderReportedAt(incident.created_at)}</strong></dd>
      </div>

      <div className="detail-item">
        <dt><span>Location</span></dt>
        <dd><strong>{displayValue(incident.location)}</strong></dd>
      </div>

      <div className="detail-item full-width">
        <dt><span>Description</span></dt>
        <dd>
          <strong className="incident-details-description">
            {displayValue(incident.description)}
          </strong>
        </dd>
      </div>

    </dl>
  )
}

export default IncidentDetails
