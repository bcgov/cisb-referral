import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";

export function ReferralSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referenceNumber = searchParams.get("ref");

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Submission Successful</h1>

        <p className="success-message">
          Your referral was successfully submitted.
        </p>

        {referenceNumber && (
          <div className="reference-box">
            <span className="reference-label">Reference Number:</span>
            <span className="reference-number">{referenceNumber}</span>
          </div>
        )}

        <p className="confirmation-note">
          A confirmation email will be sent to your registered email address.
        </p>

        <p className="thank-you">Thank you!</p>

        <div className="success-actions">
          <Button variant="primary" onPress={() => navigate("/")}>
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
