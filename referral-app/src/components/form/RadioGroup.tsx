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
import type { SelectOption } from "../../types";

type OptionsType = readonly string[] | readonly SelectOption[];

interface RadioGroupFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly options: OptionsType;
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly orientation?: "horizontal" | "vertical";
}

function isStringArray(options: OptionsType): options is readonly string[] {
  return options.length === 0 || typeof options[0] === "string";
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

  const items = isStringArray(options)
    ? options.map((opt) => ({ id: opt, label: opt }))
    : options.map((opt) => ({ id: opt.id, label: opt.name }));

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
      {items.map((item) => (
        <Radio key={item.id} value={item.id}>
          {item.label}
        </Radio>
      ))}
    </BCGovRadioGroup>
  );
}
