import { useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";
import "./Home.css";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>CISB Referral</h1>
      </div>
      <div className="home-content">
        <div className="home-actions">
          <Button variant="primary" onPress={() => navigate("/referrals")}>
            Referral Form
          </Button>

          <Button variant="primary" onPress={() => navigate("/profile")}>
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
