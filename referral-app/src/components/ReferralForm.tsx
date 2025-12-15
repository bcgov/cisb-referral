import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { z } from "zod";
import { Button } from "@bcgov/design-system-react-components";
import {
  referralSchema,
  type ReferralFormData,
  isUrgentReferral,
} from "../schemas/referralSchema";
import {
  ReferralDetailsSection,
  IndividualInfoSection,
  SupportServicesSection,
} from "./sections";
import { useLookupData } from "../hooks";

const defaultValues: Partial<z.infer<typeof referralSchema>> = {
  currentlyConnectedSupports: [],
  neededSupports: [],
};

export function ReferralForm() {
  const { regions, ministries, agencyTypes, isLoading, error } =
    useLookupData();

  const form = useForm<ReferralFormData>({
    resolver: standardSchemaResolver(referralSchema),
    defaultValues,
  });

  const onSubmit = (data: ReferralFormData) => {
    const isUrgent = isUrgentReferral(data);
    console.log("Form submitted:", data);
    console.log("Urgent:", isUrgent);
    alert(`Form submitted! Urgent: ${isUrgent}`);
  };

  if (isLoading) {
    return <div>Loading form...</div>;
  }

  if (error) {
    return <div>Error loading form data. Please try again later.</div>;
  }

  return (
    <div className="referral-form-container">
      <h1>CISB Referral Form</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ReferralDetailsSection
          form={form}
          ministries={ministries}
          agencyTypes={agencyTypes}
        />
        <IndividualInfoSection form={form} regions={regions} />
        <SupportServicesSection form={form} />
        <div className="form-actions">
          <Button type="submit" variant="primary">
            Submit Referral
          </Button>
        </div>
      </form>
    </div>
  );
}
