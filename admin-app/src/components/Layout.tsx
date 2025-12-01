import { Outlet, NavLink } from "react-router-dom";
import { Header, Footer } from "@bcgov/design-system-react-components";
import "./Layout.css";

export function Layout() {
  return (
    <div className="app-layout">
      <Header title="CISB Admin" />
      <div className="app-body">
        <nav className="sidebar">
          <ul className="nav-list">
            <li>
              <NavLink to="/referrals" className="nav-link">
                Referrals
              </NavLink>
            </li>
            <li>
              <NavLink to="/regions" className="nav-link">
                Regions
              </NavLink>
            </li>
            <li>
              <NavLink to="/ministries" className="nav-link">
                Ministries
              </NavLink>
            </li>
            <li>
              <NavLink to="/agency-types" className="nav-link">
                Agency Types
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <div className="app-footer">
        <Footer />
      </div>
    </div>
  );
}
