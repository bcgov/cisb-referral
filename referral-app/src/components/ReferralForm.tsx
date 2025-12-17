import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { z } from "zod";
import type { AxiosError } from "axios";
import { Button } from "@bcgov/design-system-react-components";
import {
  referralSchema,
  type ReferralFormData,
} from "../schemas/referralSchema";
import {
  ReferralDetailsSection,
  IndividualInfoSection,
  SupportServicesSection,
} from "./sections";
import { useLookupData } from "../hooks";
import { apiService } from "../services";

const defaultValues: Partial<z.infer<typeof referralSchema>> = {
  currentlyConnectedSupports: [],
  neededSupports: [],
};

export function ReferralForm() {
  const navigate = useNavigate();
  const { regions, ministries, agencyTypes, isLoading, error } =
    useLookupData();

  const [submitStatus, setSubmitStatus] = useState<{
    type: "idle" | "loading" | "error";
    message?: string;
  }>({ type: "idle" });

  const form = useForm<ReferralFormData>({
    resolver: standardSchemaResolver(referralSchema),
    defaultValues,
  });

  const onSubmit = async (data: ReferralFormData) => {
    setSubmitStatus({ type: "loading" });

    try {
      const response = await apiService.createReferral(data);
      navigate(`/success?ref=${response.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (err instanceof Error ? err.message : "Failed to submit referral");
      setSubmitStatus({ type: "error", message });
    }
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

      {submitStatus.type === "error" && (
        <div className="alert alert-error">{submitStatus.message}</div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ReferralDetailsSection
          form={form}
          ministries={ministries}
          agencyTypes={agencyTypes}
        />
        <IndividualInfoSection form={form} regions={regions} />
        <SupportServicesSection form={form} />
        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            isDisabled={submitStatus.type === "loading"}
          >
            {submitStatus.type === "loading"
              ? "Submitting..."
              : "Submit Referral"}
          </Button>
        </div>
      </form>
    </div>
  );
}
