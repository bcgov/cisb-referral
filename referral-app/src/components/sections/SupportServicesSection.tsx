import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import { FormField, TextArea } from "../form";

interface SupportServicesSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function SupportServicesSection({ form }: SupportServicesSectionProps) {
  const { register } = form;

  return (
    <section>
      <h2>Support Services</h2>

      <FormField
        label="Which supports are they currently connected with? (Optional)"
        htmlFor="currentlyConnectedSupports"
      >
        {/* Multi-select will be added here */}
      </FormField>

      <FormField
        label="Which supports do they need? (Optional)"
        htmlFor="neededSupports"
      >
        {/* Multi-select will be added here */}
      </FormField>

      <FormField
        label="Brief summary of the reason for referral (Optional)"
        htmlFor="referralSummary"
      >
        <TextArea
          id="referralSummary"
          rows={6}
          registration={register("referralSummary")}
        />
      </FormField>
    </section>
  );
}
