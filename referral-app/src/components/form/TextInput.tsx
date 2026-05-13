import { TextField } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { FieldError } from "./FieldError";

interface TextInputProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly type?: "text" | "email" | "tel" | "password" | "url" | "date";
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly rules?: RegisterOptions<T, FieldPath<T>>;
  readonly onChangeCallback?: (value: string) => void;
}

export function TextInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  description,
  isRequired = false,
  rules,
  onChangeCallback,
}: Readonly<TextInputProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const handleChange = (value: string) => {
    field.onChange(value);
    onChangeCallback?.(value);
  };

  return (
    <div>
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
      />
      <FieldError message={error?.message} />
    </div>
  );
}
