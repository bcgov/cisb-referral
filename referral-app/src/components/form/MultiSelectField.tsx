import Select from "react-select";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";
import type { SelectOption } from "../../types";

interface Option {
  readonly value: string;
  readonly label: string;
}

type OptionsType = readonly string[] | readonly SelectOption[];

interface MultiSelectFieldProps<T extends FieldValues> {
  readonly id: string;
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly options: OptionsType;
  readonly placeholder?: string;
  readonly label?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
}

function isStringArray(options: OptionsType): options is readonly string[] {
  return options.length === 0 || typeof options[0] === "string";
}

function getControlBorderColor(hasError: boolean, isFocused: boolean): string {
  if (hasError) {
    return "var(--support-border-color-danger)";
  }
  if (isFocused) {
    return "var(--surface-color-border-active)";
  }
  return "var(--surface-color-border-default)";
}

function getOptionBackgroundColor(
  isSelected: boolean,
  isFocused: boolean
): string {
  if (isSelected) {
    return "var(--surface-color-primary-button-default)";
  }
  if (isFocused) {
    return "var(--surface-color-background-light-blue)";
  }
  return "transparent";
}

export function MultiSelectField<T extends FieldValues>({
  id,
  name,
  control,
  options,
  placeholder = "Select...",
  label,
  description,
  isRequired = false,
}: Readonly<MultiSelectFieldProps<T>>) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const selectOptions: Option[] = isStringArray(options)
    ? options.map((opt) => ({ value: opt, label: opt }))
    : options.map((opt) => ({ value: opt.id, label: opt.name }));

  const selectedValues = selectOptions.filter((opt) =>
    (value as string[] | undefined)?.includes(opt.value)
  );

  return (
    <div className="multi-select-field">
      {label && (
        <label
          htmlFor={id}
          className="bcds-react-aria-TextField--Label"
          style={{
            font: "var(--typography-regular-small-body)",
            color: "var(--typography-color-primary)",
            padding: "var(--layout-padding-xsmall) var(--layout-padding-none)",
            display: "block",
          }}
        >
          {label}
          {isRequired && (
            <span
              style={{
                color: "var(--typography-color-secondary)",
                padding:
                  "var(--layout-padding-none) var(--layout-padding-xsmall)",
              }}
            >
              (required)
            </span>
          )}
        </label>
      )}
      <Select
        inputId={id}
        ref={ref}
        isMulti
        options={selectOptions}
        value={selectedValues}
        onChange={(selected) => {
          onChange(selected ? selected.map((s) => s.value) : []);
        }}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: getControlBorderColor(!!error, state.isFocused),
            borderRadius: "var(--layout-border-radius-medium)",
            boxShadow: state.isFocused
              ? "0 0 0 2px var(--surface-color-border-active)"
              : "none",
            "&:hover": {
              borderColor: "var(--surface-color-border-dark)",
            },
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: getOptionBackgroundColor(
              state.isSelected,
              state.isFocused
            ),
          }),
        }}
      />
      {description && (
        <span
          style={{
            font: "var(--typography-regular-small-body)",
            color: "var(--typography-color-secondary)",
            padding: "var(--layout-padding-xsmall) var(--layout-padding-none)",
            display: "block",
          }}
        >
          {description}
        </span>
      )}
      {error && (
        <span
          style={{
            font: "var(--typography-regular-small-body)",
            color: "var(--typography-color-danger)",
            padding: "var(--layout-padding-xsmall) var(--layout-padding-none)",
            display: "block",
          }}
        >
          {error.message}
        </span>
      )}
    </div>
  );
}
