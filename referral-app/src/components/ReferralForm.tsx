import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { z } from "zod";
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

const defaultValues: Partial<z.infer<typeof referralSchema>> = {
  currentlyConnectedSupports: [],
  neededSupports: [],
  pendingRelease: "No",
};

export function ReferralForm() {
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

  return (
    <div>
      <h1>CISB Referral Form</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ReferralDetailsSection form={form} />
        <IndividualInfoSection form={form} />
        <SupportServicesSection form={form} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
