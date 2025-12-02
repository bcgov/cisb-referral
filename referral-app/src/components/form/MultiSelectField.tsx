import Select from "react-select";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

interface Option {
  readonly value: string;
  readonly label: string;
}

interface MultiSelectFieldProps<T extends FieldValues> {
  readonly id: string;
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly options: readonly string[];
  readonly placeholder?: string;
  readonly label?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
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

  const selectOptions: Option[] = options.map((opt) => ({
    value: opt,
    label: opt,
  }));

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
            borderColor: error
              ? "var(--support-border-color-danger)"
              : state.isFocused
              ? "var(--surface-color-border-active)"
              : "var(--surface-color-border-default)",
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
            backgroundColor: state.isSelected
              ? "var(--surface-color-primary-button-default)"
              : state.isFocused
              ? "var(--surface-color-background-light-blue)"
              : "transparent",
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
