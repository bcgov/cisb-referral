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
  readonly onChangeCallback?: (value: string) => void;
}

export function TextInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  description,
  isRequired = false,
  onChangeCallback,
}: Readonly<TextInputProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const handleChange = (value: string) => {
    field.onChange(value);
    onChangeCallback?.(value);
  };

  return (
    <TextField
      label={label}
      type={type}
      value={field.value ?? ""}
      onChange={handleChange}
      onBlur={field.onBlur}
      name={field.name}
      description={description}
      isRequired={isRequired}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
