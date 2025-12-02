import { TextField } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface TextInputProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly type?: "text" | "email" | "tel" | "password" | "url" | "date";
  readonly description?: string;
  readonly isRequired?: boolean;
}

export function TextInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  description,
  isRequired = false,
}: Readonly<TextInputProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      label={label}
      type={type}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      description={description}
      isRequired={isRequired}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
