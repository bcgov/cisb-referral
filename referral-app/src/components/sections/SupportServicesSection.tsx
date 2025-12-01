import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormData } from "../../schemas/referralSchema";
import { SupportType } from "../../schemas/referralSchema";
import { FormField, TextArea, MultiSelectField } from "../form";

interface SupportServicesSectionProps {
  form: UseFormReturn<ReferralFormData>;
}

export function SupportServicesSection({ form }: SupportServicesSectionProps) {
  const { register, control, watch } = form;

  const currentlyConnectedSupports = watch("currentlyConnectedSupports");
  const neededSupports = watch("neededSupports");

  const showCurrentSupportsOther =
    currentlyConnectedSupports?.includes("Others");
  const showNeededSupportsOther = neededSupports?.includes("Others");

  return (
    <section>
      <h2>Support Services</h2>

      <FormField
        label="Which supports are they currently connected with? (Optional)"
        htmlFor="currentlyConnectedSupports"
      >
        <MultiSelectField
          id="currentlyConnectedSupports"
          name="currentlyConnectedSupports"
          control={control}
          options={SupportType.options}
          placeholder="Select supports..."
        />
      </FormField>

      {showCurrentSupportsOther && (
        <FormField
          label="Specify Other Supports"
          htmlFor="currentlyConnectedSupportsOther"
          required
        >
          <input
            id="currentlyConnectedSupportsOther"
            type="text"
            {...register("currentlyConnectedSupportsOther")}
          />
        </FormField>
      )}

      <FormField
        label="Which supports do they need? (Optional)"
        htmlFor="neededSupports"
      >
        <MultiSelectField
          id="neededSupports"
          name="neededSupports"
          control={control}
          options={SupportType.options}
          placeholder="Select supports..."
        />
      </FormField>

      {showNeededSupportsOther && (
        <FormField
          label="Specify Other Supports Needed"
          htmlFor="neededSupportsOther"
          required
        >
          <input
            id="neededSupportsOther"
            type="text"
            {...register("neededSupportsOther")}
          />
        </FormField>
      )}

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
