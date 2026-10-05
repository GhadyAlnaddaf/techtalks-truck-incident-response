import { ROLES } from "../features/auth/roles.js";

/**
 * Which pages each role sees in the app shell (TIR-61).
 *
 * Plain data, so it runs under `npm test`: AppShell maps the icon key to
 * a lucide icon. Link only to routes that exist in App.jsx. `end` marks a
 * link that is active on its exact path only, which "/" needs.
 *
 * EXTENSION POINT: a new page for a role is one entry in its list here
 * (plus an icon key in AppShell if it needs a new icon).
 */
const NAV_LINKS_BY_ROLE = {
  [ROLES.TRUCK_DRIVER]: [
    { path: "/", label: "Report Incident", icon: "report", end: true },
  ],
  [ROLES.DISPATCHER]: [
    { path: "/dispatcher", label: "Dashboard", icon: "dashboard" },
    { path: "/history", label: "History", icon: "history" },
  ],
};

/**
 * @param {string | null | undefined} role - A value from ROLES.
 * @returns {{ path: string, label: string, icon: string, end?: boolean }[]}
 *   The role's links, or [] for a missing or unknown role.
 */
export function getNavLinks(role) {
  // hasOwn, so "constructor" or "__proto__" never resolve to a list.
  if (!Object.hasOwn(NAV_LINKS_BY_ROLE, role)) return [];

  return NAV_LINKS_BY_ROLE[role].map((link) => ({ ...link }));
}
