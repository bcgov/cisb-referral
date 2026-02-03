import { Outlet } from "react-router-dom";
import { Header, Footer, Button } from "@bcgov/design-system-react-components";
import { logout } from "../auth";
import "./Layout.css";

export const Layout = () => {
  return (
    <div className="app-layout">
      <Header title="CISB Referral" />
      <div className="header-actions">
        <Button variant="secondary" size="small" onPress={logout}>
          Logout
        </Button>
      </div>
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
