import { Outlet } from "react-router-dom";
import { Header, Footer, Button } from "@bcgov/design-system-react-components";
import { logout } from "../auth";
import { useProfile } from "../hooks";
import "./Layout.css";

export const Layout = () => {
  const { profile } = useProfile();

  return (
    <div className="app-layout">
      <Header title="CISB Referral" />
      <div className="header-actions">
        {profile?.fullName && (
          <span className="welcome-message">Welcome, {profile.fullName}</span>
        )}
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
