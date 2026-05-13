import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { AxiosError } from "axios";
import { Button } from "@bcgov/design-system-react-components";
import {
  ReferredByType,
  referralSchema,
  type ReferralFormData,
  type ReferralFormInput,
} from "../schemas/referralSchema";
import {
  ReferralDetailsSection,
  IndividualInfoSection,
  SupportServicesSection,
} from "./sections";
import { useLookupData, useProfile } from "../hooks";
import { apiService } from "../services";
import { isOtherLookupOption } from "../utils/formHelpers";

export function ReferralForm() {
  const navigate = useNavigate();
  const { regions, ministries, agencyTypes, isLoading, error } =
    useLookupData();
  const { profile } = useProfile();

  const [submitStatus, setSubmitStatus] = useState<{
    type: "idle" | "loading" | "error";
    message?: string;
  }>({ type: "idle" });

  const form = useForm<ReferralFormInput, unknown, ReferralFormData>({
    resolver: standardSchemaResolver(referralSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      referrerContactName: profile?.fullName ?? "",
      referrerPhone: profile?.phone ?? "",
      referrerEmail: profile?.email ?? "",
      currentlyConnectedSupports: [],
      neededSupports: [],
    },
  });

  const onInvalid = () => {
    setSubmitStatus({ type: "idle" });
  };

  const validateOtherDetailsForSubmit = (data: ReferralFormData): boolean => {
    let hasErrors = false;

    const selectedMinistry = ministries.find((ministry) => {
      return ministry.id === data.ministryId;
    });
    const isOtherMinistry =
      data.referredBy === ReferredByType.PARTNER_MINISTRY &&
      isOtherLookupOption(selectedMinistry?.name);

    if (isOtherMinistry && !data.ministryNameOther?.trim()) {
      form.setError("ministryNameOther", {
        type: "manual",
        message: "Please specify the ministry name",
      });
      hasErrors = true;
    } else {
      form.clearErrors("ministryNameOther");
    }

    const selectedAgencyType = agencyTypes.find((agencyType) => {
      return agencyType.id === data.agencyTypeId;
    });
    const isOtherAgencyType =
      data.referredBy === ReferredByType.PARTNER_AGENCY &&
      isOtherLookupOption(selectedAgencyType?.name);

    if (isOtherAgencyType && !data.agencyTypeOther?.trim()) {
      form.setError("agencyTypeOther", {
        type: "manual",
        message: "Please specify the agency type",
      });
      hasErrors = true;
    } else {
      form.clearErrors("agencyTypeOther");
    }

    return !hasErrors;
  };

  const onSubmit = async (data: ReferralFormData) => {
    if (!validateOtherDetailsForSubmit(data)) {
      setSubmitStatus({ type: "idle" });
      return;
    }

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

      <form noValidate onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
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
