import Select from "react-select";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps<T extends FieldValues> {
  id: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: readonly string[];
  placeholder?: string;
}

export function MultiSelectField<T extends FieldValues>({
  id,
  name,
  control,
  options,
  placeholder = "Select...",
}: MultiSelectFieldProps<T>) {
  const {
    field: { onChange, value, ref },
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
    />
  );
}
