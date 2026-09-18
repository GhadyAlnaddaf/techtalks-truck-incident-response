/** Same host and path shape as the list fetch in DispatcherDashboard.jsx. */
const INCIDENTS_LIST_URL = 'http://127.0.0.1:8000/api/incidents/list/'

/**
 * Loads the details of a single incident.
 *
 * Interim implementation: the backend has no single-incident endpoint yet, so
 * this reads the list and picks the matching entry. When
 * GET /api/incidents/<id>/ exists, this function is the only thing that has to
 * change -- callers already ask for one incident by id.
 *
 * @param {string|number} id - Incident id to look for.
 * @param {{ signal?: AbortSignal }} [options] - Lets the caller cancel.
 * @returns {Promise<object>} The matching incident from the list response.
 * @throws {Error} With a message that is safe to show the dispatcher, or the
 *   original AbortError when the request was cancelled.
 */
export async function fetchIncidentById(id, { signal } = {}) {
  let response

  try {
    response = await fetch(INCIDENTS_LIST_URL, { signal })
  } catch (error) {
    // A cancelled request is not a failure the dispatcher should be told about.
    if (error.name === 'AbortError') throw error
    throw new Error('Could not reach the server.', { cause: error })
  }

  // Django error pages are HTML, so the body is not always JSON.
  let data
  try {
    data = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Could not load incident details.')
  }

  if (!data || !Array.isArray(data.incidents)) {
    throw new Error('Could not load incident details.')
  }

  // Compared as strings: the id comes back as a number but may reach us as a
  // string once this is driven by a route parameter.
  const incident = data.incidents.find(
    (entry) => String(entry.id) === String(id),
  )

  if (!incident) {
    throw new Error('This incident could not be found.')
  }

  return incident
}
