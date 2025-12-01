import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectFieldProps {
  id: string;
  options: readonly string[];
  registration: UseFormRegisterReturn;
  placeholder?: string;
}

export function SelectField({
  id,
  options,
  registration,
  placeholder = "Select",
}: SelectFieldProps) {
  return (
    <select id={id} {...registration}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
