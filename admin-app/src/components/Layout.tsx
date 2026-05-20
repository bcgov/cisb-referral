import { useState, useCallback } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Header, Footer } from "@bcgov/design-system-react-components";
import { logout } from "../auth";
import { useCurrentUser } from "../hooks";
import { UserRole } from "../types";
import { AccessDenied } from "./AccessDenied";

/** Navigation links displayed in sidebar */
const NAV_ITEMS = [
  { to: "/referrals", label: "Referrals" },
  { to: "/regions", label: "Regions" },
  { to: "/ministries", label: "Ministries" },
  { to: "/agency-types", label: "Agency Types" },
] as const;

const USER_MANAGEMENT_NAV_ITEM = { to: "/users", label: "Users" } as const;

const SYSTEM_ADMIN_NAV_ITEMS = [
  { to: "/audit-history", label: "Audit History" },
] as const;

/**
 * Root layout with a collapsible sidebar.
 * Sidebar is always visible on md+ screens and toggles
 * via a hamburger button on smaller viewports.
 */
export function Layout() {
  const { currentUser, isSystemAdmin, isForbidden } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (isForbidden) {
    return <AccessDenied />;
  }

  const navItems =
    currentUser && currentUser.role !== UserRole.USER
      ? [...NAV_ITEMS, USER_MANAGEMENT_NAV_ITEM]
      : NAV_ITEMS;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            sidebarOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={sidebarOpen}
          aria-controls="sidebar-nav"
          className="md:hidden p-3 text-white bg-bcgov-blue hover:bg-bcgov-blue-dark
            focus:outline-none focus:ring-2 focus:ring-bcgov-gold"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex-1">
          <Header title="CISB Referral App" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar navigation */}
        <nav
          id="sidebar-nav"
          aria-label="Main navigation"
          className={`
            w-55 shrink-0 bg-bcgov-blue-light py-4 flex flex-col
            ${sidebarOpen ? "flex" : "hidden"} md:flex
          `}
        >
          <ul className="list-none m-0 p-0 flex-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                      isActive
                        ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                        : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            {isSystemAdmin &&
              SYSTEM_ADMIN_NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                        isActive
                          ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                          : ""
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
          </ul>
          <div className="border-t border-bcgov-blue-dark mt-4 pt-4 px-4">
            {currentUser && (
              <p
                className="text-white text-sm mb-2 truncate"
                title={currentUser.fullName}
              >
                {currentUser.fullName}
              </p>
            )}
            <button
              type="button"
              onClick={logout}
              aria-label="Logout of application"
              className="w-full py-2 px-4 bg-bcgov-blue-dark text-white rounded
                font-medium hover:bg-bcgov-blue-hover focus:outline-none
                focus:ring-2 focus:ring-bcgov-gold focus:ring-offset-2
                focus:ring-offset-bcgov-blue-light transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="flex-1 bg-bcgov-gray-light flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
