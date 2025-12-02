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
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly options: readonly string[];
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly orientation?: "horizontal" | "vertical";
}

export function RadioGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  description,
  isRequired = false,
  orientation = "horizontal",
}: Readonly<RadioGroupFieldProps<T>>) {
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
