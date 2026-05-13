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
import { isStringArray, type OptionsType } from "../../utils/formHelpers";
import { FieldError } from "./FieldError";

interface RadioGroupFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly label: string;
  readonly options: OptionsType;
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

  const items = isStringArray(options)
    ? options.map((opt) => ({ id: opt, label: opt }))
    : options.map((opt) => ({ id: opt.id, label: opt.name }));

  return (
    <div>
      <BCGovRadioGroup
        label={label}
        value={field.value ?? ""}
        onChange={field.onChange}
        orientation={orientation}
        description={description}
        isRequired={isRequired}
        isInvalid={!!error}
      >
        {items.map((item) => (
          <Radio key={item.id} value={item.id}>
            {item.label}
          </Radio>
        ))}
      </BCGovRadioGroup>
      <FieldError message={error?.message} />
    </div>
  );
}
