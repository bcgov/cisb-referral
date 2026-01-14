import Select from "react-select";

interface Option {
  readonly value: string;
  readonly label: string;
}

interface MultiSelectProps {
  readonly id: string;
  readonly label: string;
  readonly options: { value: string; label: string }[];
  readonly value: string[];
  readonly onChange: (values: string[]) => void;
  readonly placeholder?: string;
}

export function MultiSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Search and select...",
}: Readonly<MultiSelectProps>) {
  const selectedValues = options.filter((opt) => value?.includes(opt.value));

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-bcgov-gray-dark mb-1"
      >
        {label}
      </label>
      <Select
        inputId={id}
        isMulti
        options={options}
        value={selectedValues}
        onChange={(selected) => {
          onChange(selected ? selected.map((s: Option) => s.value) : []);
        }}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#003366" : "#d1d5db",
            borderRadius: "0.25rem",
            boxShadow: state.isFocused
              ? "0 0 0 2px rgba(0, 51, 102, 0.2)"
              : "none",
            "&:hover": {
              borderColor: "#9ca3af",
            },
            minHeight: "42px",
          }),
          option: (base, state) => {
            let backgroundColor = "transparent";
            if (state.isSelected) {
              backgroundColor = "#003366";
            } else if (state.isFocused) {
              backgroundColor = "#e5f0ff";
            }
            return {
              ...base,
              backgroundColor,
              color: state.isSelected ? "white" : "#1a1a1a",
              "&:active": {
                backgroundColor: "#003366",
              },
            };
          },
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#e5f0ff",
            borderRadius: "0.25rem",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#003366",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#003366",
            "&:hover": {
              backgroundColor: "#003366",
              color: "white",
            },
          }),
        }}
      />
    </div>
  );
}
