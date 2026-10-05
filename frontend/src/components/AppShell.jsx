import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
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
 * The app shell (TIR-54, role-aware since TIR-61).
 *
 * Desktop:
 * - Navy sidebar
 *
 * Mobile:
 * - Top bar
 * - Drawer menu below 768px
 *
 * The shell is presentational and receives the current page
 * through the `children` prop.
 */

const NAV_ICONS = {
  report: FilePlus,
  dashboard: LayoutDashboard,
  history: Clock,
};

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

function AppShell({ role, onLogout, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuButtonRef = useRef(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const links = getNavLinks(role);

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      <aside className="shell-sidebar">
        <div className="shell-brand-row">
          <Brand />
        </div>

        <nav className="shell-nav" aria-label="Main">
          <NavItems links={links} onLogout={onLogout} />
        </nav>
      </aside>

      {/* Mobile top bar */}
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

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="shell-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
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

      {/* Current page */}
      <main className="shell-main">{children}</main>
    </div>
  );
}

export default AppShell;
