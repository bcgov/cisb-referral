import { useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";
import "./Home.css";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome to CISB Referral</h1>
      <p className="home-description">
        Use this portal to submit referrals or manage your profile.
      </p>

      <div className="home-actions">
        <Button variant="primary" onPress={() => navigate("/referrals")}>
          Submit a Referral
        </Button>

        <Button variant="secondary" onPress={() => navigate("/profile")}>
          My Profile
        </Button>
      </div>
    </div>
  );
};
