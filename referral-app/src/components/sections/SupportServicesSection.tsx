import type { UseFormReturn } from "react-hook-form";
import type { ReferralFormInput } from "../../schemas/referralSchema";
import { SupportType, SupportTypeOptions } from "../../schemas/referralSchema";
import { FormField, TextInput, TextAreaField, MultiSelectField } from "../form";

interface SupportServicesSectionProps {
  readonly form: UseFormReturn<ReferralFormInput>;
}

export function SupportServicesSection({
  form,
}: Readonly<SupportServicesSectionProps>) {
  const { control, watch } = form;

  const currentlyConnectedSupports = watch("currentlyConnectedSupports");
  const neededSupports = watch("neededSupports");

  const showCurrentSupportsOther = currentlyConnectedSupports?.includes(
    SupportType.OTHERS,
  );
  const showNeededSupportsOther = neededSupports?.includes(SupportType.OTHERS);

  return (
    <section>
      <div className="form-grid">
        <div className="form-field-full">
          <FormField>
            <MultiSelectField
              id="currentlyConnectedSupports"
              name="currentlyConnectedSupports"
              control={control}
              options={SupportTypeOptions}
              placeholder="Select supports..."
              label="Which supports are they currently connected with? (Optional)"
            />
          </FormField>
        </div>

        {showCurrentSupportsOther && (
          <FormField>
            <TextInput
              name="currentlyConnectedSupportsOther"
              control={control}
              label="Specify Other Supports"
              isRequired
            />
          </FormField>
        )}

        <div className="form-field-full">
          <FormField>
            <MultiSelectField
              id="neededSupports"
              name="neededSupports"
              control={control}
              options={SupportTypeOptions}
              placeholder="Select supports..."
              label="Which supports do they need? (Optional)"
            />
          </FormField>
        </div>

        {showNeededSupportsOther && (
          <FormField>
            <TextInput
              name="neededSupportsOther"
              control={control}
              label="Specify Other Supports Needed"
              isRequired
            />
          </FormField>
        )}

        <div className="form-field-full">
          <FormField>
            <TextAreaField
              name="referralReason"
              control={control}
              label="Brief summary of the reason for referral"
              maxLength={5000}
              isRequired
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}
