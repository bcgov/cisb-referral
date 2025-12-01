import { Select } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { Key } from "react-aria-components";

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: readonly string[];
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option",
  description,
  isRequired = false,
}: SelectFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const items = options.map((opt) => ({
    id: opt,
    label: opt,
  }));

  const handleSelectionChange = (key: Key | null) => {
    field.onChange(key ?? "");
  };

  return (
    <Select
      label={label}
      items={items}
      selectedKey={field.value || null}
      onSelectionChange={handleSelectionChange}
      onBlur={field.onBlur}
      name={field.name}
      placeholder={placeholder}
      description={description}
      isRequired={isRequired}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
