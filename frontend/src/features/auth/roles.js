/**
 * User roles (TIR-61).
 *
 * The exact values stored in User.role on the backend
 * (backend/users/models.py, TIR-59). This is the only place in the
 * frontend that spells them out: import ROLES, never the strings.
 */
export const ROLES = Object.freeze({
  TRUCK_DRIVER: "truck_driver",
  DISPATCHER: "dispatcher",
});
