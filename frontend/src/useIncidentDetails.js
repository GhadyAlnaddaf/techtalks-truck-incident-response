import { useCallback, useEffect, useState } from "react";

import { fetchIncidentById } from "./incidentsApi";

const INITIAL_RESULT = {
  key: null,
  status: "loading",
  incident: null,
  errorMessage: "",
};

export function useIncidentDetails(incidentId) {
  const [result, setResult] = useState(INITIAL_RESULT);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (incidentId === null || incidentId === undefined) {
      return;
    }

    const controller = new AbortController();

    const requestKey = `${incidentId}#${attempt}`;

    setResult({
      key: requestKey,
      status: "loading",
      incident: null,
      errorMessage: "",
    });

    fetchIncidentById(incidentId, {
      signal: controller.signal,
    })
      .then((loadedIncident) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          key: requestKey,
          status: "loaded",
          incident: loadedIncident,
          errorMessage: "",
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          key: requestKey,
          status: "error",
          incident: null,
          errorMessage: error.message || "Could not load incident details.",
        });
      });

    return () => controller.abort();
  }, [incidentId, attempt]);

  if (incidentId === null || incidentId === undefined) {
    return {
      state: "idle",
      incident: null,
      errorMessage: "",
      retry,
    };
  }

  const requestKey = `${incidentId}#${attempt}`;

  const current = result.key === requestKey ? result : INITIAL_RESULT;

  return {
    state: current.status,
    incident: current.status === "loaded" ? current.incident : null,
    errorMessage: current.status === "error" ? current.errorMessage : "",
    retry,
  };
}
