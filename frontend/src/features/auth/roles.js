/**
 * User roles (TIR-61).
 *
 * The exact values the login API (TIR-60) returns for a user's role.
 * These are the display labels of User.Role in backend/users/models.py,
 * not the stored values (truck_driver, dispatcher), because the API
 * sends the labels. This is the only place in the frontend that spells
 * them out: import ROLES, never the strings.
 */
export const ROLES = Object.freeze({
  TRUCK_DRIVER: "Truck Driver",
  DISPATCHER: "Dispatcher",
});
