import { TextArea } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface TextAreaFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly description?: string;
  readonly maxLength?: number;
  readonly isRequired?: boolean;
}

export function TextAreaField<T extends FieldValues>({
  name,
  control,
  label,
  description,
  maxLength,
  isRequired = false,
}: Readonly<TextAreaFieldProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextArea
      label={label}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      description={description}
      maxLength={maxLength}
      isRequired={isRequired}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
