import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Clock, FilePlus, LayoutDashboard, Menu, X } from "lucide-react";

import Brand from "./Brand";
import "./AppShell.css";

/**
 * The app shell (TIR-54): navy sidebar on desktop, top bar plus drawer
 * below 768px. Presentational only -- it renders whatever page the router
 * puts inside it and owns no state beyond the drawer.
 *
 * EXTENSION POINT: the sidebar and the drawer are both rendered from this
 * one array, so adding a page later is a single entry here. It links only
 * to routes that exist in App.jsx.
 */
const NAV_ITEMS = [
  { to: "/", label: "Report Incident", icon: FilePlus, end: true },
  { to: "/dispatcher", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: Clock },
];

function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  // Subscribes to a platform event. The state update happens inside the
  // listener, not in the effect body.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  /* The drawer closes from the link's own onClick rather than from an
     effect watching the route, so navigating never triggers a cascading
     render. */
  const navItems = (onNavigate) =>
    NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? "shell-nav-item shell-nav-item-active" : "shell-nav-item"
        }
      >
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ));

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-brand-row">
          <Brand />
        </div>

        <nav className="shell-nav" aria-label="Main">
          {navItems(undefined)}
        </nav>
      </aside>

      <header className="shell-topbar">
        <Brand />

        <button
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
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <nav className="shell-nav" aria-label="Main menu">
            {navItems(closeDrawer)}
          </nav>
        </div>
      )}

      <main className="shell-main">{children}</main>
    </div>
  );
}

export default AppShell;
