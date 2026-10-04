import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Clock,
  FilePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import Brand from "./Brand";
import { getNavLinks } from "./navLinks";
import "./AppShell.css";

/**
 * The app shell (TIR-54, role-aware since TIR-61): navy sidebar on
 * desktop, top bar plus drawer below 768px. Presentational only -- it is
 * a layout route in App.jsx, renders the matched page through <Outlet />,
 * and owns no state beyond the drawer.
 *
 * Props:
 *   role      A value from ROLES. Picks the links via getNavLinks; a
 *             missing or unknown role shows no links, only Logout.
 *   onLogout  Called when Logout is pressed. The shell does not know how
 *             logging out works.
 *
 * The sidebar and the drawer render the same list, so they never differ.
 */

/** Icon key from navLinks.js -> lucide icon. */
const NAV_ICONS = {
  report: FilePlus,
  dashboard: LayoutDashboard,
  history: Clock,
};

/* The nav rows, shared by the sidebar and the drawer. The drawer closes
   from the link's own onClick rather than from an effect watching the
   route, so navigating never triggers a cascading render. Logout is the
   last item, as in the mockup. */
function NavItems({ links, onNavigate, onLogout }) {
  return (
    <>
      {links.map(({ path, label, icon, end }) => {
        const Icon = NAV_ICONS[icon];

        return (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive
                ? "shell-nav-item shell-nav-item-active"
                : "shell-nav-item"
            }
          >
            {Icon && <Icon size={20} aria-hidden="true" />}
            <span>{label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        className="shell-nav-item shell-nav-button"
        onClick={() => {
          onNavigate?.();
          onLogout?.();
        }}
      >
        <LogOut size={20} aria-hidden="true" />
        <span>Logout</span>
      </button>
    </>
  );
}

function AppShell({ role, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuButtonRef = useRef(null);

  // Focus goes back to the button that opened the drawer. (Opening moves
  // focus in through autoFocus on the close button.)
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Subscribes to a platform event. The state update happens inside the
  // listener, not in the effect body.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  const links = getNavLinks(role);

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-brand-row">
          <Brand />
        </div>

        <nav className="shell-nav" aria-label="Main">
          <NavItems links={links} onLogout={onLogout} />
        </nav>
      </aside>

      <header className="shell-topbar">
        <Brand />

        <button
          ref={menuButtonRef}
          type="button"
          className="shell-icon-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      {drawerOpen && (
        <div className="shell-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="shell-drawer-head">
            <Brand />

            <button
              type="button"
              className="shell-icon-button shell-icon-button-invert"
              onClick={closeDrawer}
              aria-label="Close menu"
              autoFocus
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <nav className="shell-nav" aria-label="Main menu">
            <NavItems
              links={links}
              onNavigate={closeDrawer}
              onLogout={onLogout}
            />
          </nav>
        </div>
      )}

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
