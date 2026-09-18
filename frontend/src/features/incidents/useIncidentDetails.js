import { useCallback, useEffect, useState } from 'react'

import { fetchIncidentById } from './incidentsApi'

const NO_RESULT = {
  key: null,
  status: 'loading',
  incident: null,
  errorMessage: '',
}

/**
 * Loads one incident's details from the backend and tracks the request.
 *
 * The result is stored together with the request key it belongs to. Anything
 * loaded for an earlier key is ignored while rendering, so the incident that
 * was selected a moment ago can never be read as the details of the one
 * selected now.
 *
 * @param {string|number|null|undefined} incidentId - Incident to load. Nothing
 *   is requested while this is null or undefined.
 * @returns {{
 *   state: 'idle'|'loading'|'error'|'loaded',
 *   incident: object|null,
 *   errorMessage: string,
 *   retry: () => void,
 * }}
 */
export function useIncidentDetails(incidentId) {
  const [result, setResult] = useState(NO_RESULT)

  // Bumped by retry() so the same incident can be requested again.
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  const requestKey = `${incidentId}#${attempt}`

  useEffect(() => {
    if (incidentId === null || incidentId === undefined) return

    const controller = new AbortController()

    fetchIncidentById(incidentId, { signal: controller.signal })
      .then((loadedIncident) => {
        // A request that lost the race was aborted by the cleanup below; it
        // must not write over the newer selection's state.
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          status: 'loaded',
          incident: loadedIncident,
          errorMessage: '',
        })
      })
      .catch((error) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          status: 'error',
          incident: null,
          errorMessage: error.message || 'Could not load incident details.',
        })
      })

    // Runs when the id changes, on retry, and on unmount.
    return () => controller.abort()
  }, [incidentId, requestKey])

  if (incidentId === null || incidentId === undefined) {
    return { state: 'idle', incident: null, errorMessage: '', retry }
  }

  // Until the answer for this exact request arrives, the request is in flight.
  const current = result.key === requestKey ? result : NO_RESULT

  return {
    state: current.status,
    incident: current.status === 'loaded' ? current.incident : null,
    errorMessage: current.status === 'error' ? current.errorMessage : '',
    retry,
  }
}
