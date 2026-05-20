import { useNavigate } from "react-router-dom";
import { Button, InlineAlert } from "@bcgov/design-system-react-components";

export function ReferralSuccess() {
  const navigate = useNavigate();
  return (
    <div className="success-container">
      <div className="success-card">
        <InlineAlert
          variant="success"
          title="Your referral has been successfully submitted!"
        />

        <p>
          CISB aims to assign urgent referrals to a Community Integration
          Specialist within 2 business hours, and non-urgent referrals within
          1-2 business days.
        </p>

        <p>
          You may be contacted by a Community Integration Specialist if more
          information on your referral is needed.
        </p>

        <p>
          Please note that due to client confidentiality and protection of
          privacy regulations, CISB may not be able to provide updates on the
          outcome or status of a referral.
        </p>

        <p>
          If you have questions about the referral process, please contact{" "}
          <a href="mailto:CISB@gov.bc.ca">CISB@gov.bc.ca</a>
        </p>

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
