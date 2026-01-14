import { Outlet, NavLink } from "react-router-dom";
import { Header, Footer } from "@bcgov/design-system-react-components";

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="CISB Admin" />
      <div className="flex flex-1">
        <nav className="w-55 bg-bcgov-blue-light shrink-0 py-4">
          <ul className="list-none m-0 p-0">
            <li>
              <NavLink
                to="/referrals"
                className={({ isActive }) =>
                  `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                    isActive
                      ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                      : ""
                  }`
                }
              >
                Referrals
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/regions"
                className={({ isActive }) =>
                  `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                    isActive
                      ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                      : ""
                  }`
                }
              >
                Regions
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ministries"
                className={({ isActive }) =>
                  `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                    isActive
                      ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                      : ""
                  }`
                }
              >
                Ministries
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/agency-types"
                className={({ isActive }) =>
                  `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                    isActive
                      ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                      : ""
                  }`
                }
              >
                Agency Types
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `block py-3 px-6 text-white no-underline font-medium transition-colors hover:bg-bcgov-blue-hover ${
                    isActive
                      ? "bg-bcgov-blue-dark border-l-4 border-bcgov-gold pl-5"
                      : ""
                  }`
                }
              >
                Users
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="flex-1 bg-bcgov-gray-light flex flex-col">
          <Outlet />
        </main>
      </div>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
