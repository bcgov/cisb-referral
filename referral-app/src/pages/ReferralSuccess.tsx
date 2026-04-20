import { useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";

export function ReferralSuccess() {
  const navigate = useNavigate();
  return (
    <div className="success-container">
      <div className="success-card">
        <h1 className="success-message">
          Your referral was successfully submitted.
        </h1>

        <p className="confirmation-note">
          A confirmation email will be sent to your email address.
        </p>

        <p className="thank-you">Thank you!</p>

        <div className="success-actions">
          <Button variant="primary" onPress={() => navigate("/referrals")}>
            Make Another Referral
          </Button>
          <Button variant="secondary" onPress={() => navigate("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
