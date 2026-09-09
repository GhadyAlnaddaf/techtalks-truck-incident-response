/**
 * Translates a Django REST Framework error response into a flat object keyed
 * by form field name, so a form can render messages next to the right input.
 *
 * DRF returns errors in this shape:
 *   { "truck_id": ["This field is required."],
 *     "non_field_errors": ["Something was wrong with the request as a whole."] }
 *
 * Every API error mapping for the incident form belongs in this one function.
 * Nothing calls it yet -- error rendering is TIR-33. It exists now so that the
 * form has a single, obvious seam to plug into when that ticket lands.
 *
 * @param {unknown} response - Parsed JSON body of a DRF error response.
 * @returns {Record<string, string>} Field name -> first message. Errors that
 *   are not tied to a field are collected under the `non_field_errors` key.
 */
export function mapApiErrorsToFields(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return {}
  }

  const fieldErrors = {}

  for (const [field, messages] of Object.entries(response)) {
    if (Array.isArray(messages)) {
      const firstString = messages.find((message) => typeof message === 'string')
      if (firstString) {
        fieldErrors[field] = firstString
      }
    } else if (typeof messages === 'string') {
      // DRF sends `detail` as a bare string for auth and permission failures.
      fieldErrors[field] = messages
    }
  }

  return fieldErrors
}
