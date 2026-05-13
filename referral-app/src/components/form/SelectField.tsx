import { Select } from "@bcgov/design-system-react-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import type { Key } from "react-aria-components";
import { isStringArray, type OptionsType } from "../../utils/formHelpers";
import { FieldError } from "./FieldError";

interface SelectFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly options: OptionsType;
  readonly placeholder?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly rules?: RegisterOptions<T, FieldPath<T>>;
  readonly onChangeCallback?: (key: Key | null) => void;
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option",
  description,
  isRequired = false,
  rules,
  onChangeCallback,
}: Readonly<SelectFieldProps<T>>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const items = isStringArray(options)
    ? options.map((opt) => ({ id: opt, label: opt }))
    : options.map((opt) => ({ id: opt.id, label: opt.name }));

  const handleSelectionChange = (key: Key | null) => {
    field.onChange(key ?? undefined);
    onChangeCallback?.(key);
  };

  return (
    <div>
      <Select
        label={label}
        items={items}
        value={field.value ?? null}
        onChange={handleSelectionChange}
        onBlur={field.onBlur}
        name={field.name}
        placeholder={placeholder}
        description={description}
        isRequired={isRequired}
        isInvalid={!!error}
      />
      <FieldError message={error?.message} />
    </div>
  );
}
