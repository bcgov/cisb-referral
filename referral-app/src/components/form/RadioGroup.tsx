import {
  RadioGroup as BCGovRadioGroup,
  Radio,
} from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface RadioGroupFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: readonly string[];
  description?: string;
  isRequired?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function RadioGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  description,
  isRequired = false,
  orientation = "horizontal",
}: RadioGroupFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <BCGovRadioGroup
      label={label}
      value={field.value ?? ""}
      onChange={field.onChange}
      orientation={orientation}
      description={description}
      isRequired={isRequired}
      isInvalid={!!error}
      errorMessage={error?.message}
    >
      {options.map((opt) => (
        <Radio key={opt} value={opt}>
          {opt}
        </Radio>
      ))}
    </BCGovRadioGroup>
  );
}
