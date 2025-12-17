import { Select } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { Key } from "react-aria-components";
import type { SelectOption } from "../../types";

type OptionsType = readonly string[] | readonly SelectOption[];

interface SelectFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly options: OptionsType;
  readonly placeholder?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
}

function isStringArray(options: OptionsType): options is readonly string[] {
  return options.length === 0 || typeof options[0] === "string";
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option",
  description,
  isRequired = false,
}: Readonly<SelectFieldProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const items = isStringArray(options)
    ? options.map((opt) => ({ id: opt, label: opt }))
    : options.map((opt) => ({ id: opt.id, label: opt.name }));

  const handleSelectionChange = (key: Key | null) => {
    field.onChange(key ?? "");
  };

  return (
    <Select
      label={label}
      items={items}
      value={field.value || null}
      onChange={handleSelectionChange}
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
