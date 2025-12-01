import type { UseFormRegisterReturn } from "react-hook-form";

interface RadioGroupProps {
  name: string;
  options: readonly string[];
  registration: UseFormRegisterReturn;
}

export function RadioGroup({ name, options, registration }: RadioGroupProps) {
  return (
    <div className="radio-group" role="radiogroup" aria-labelledby={name}>
      {options.map((opt) => (
        <label key={opt}>
          <input type="radio" value={opt} {...registration} />
          {opt}
        </label>
      ))}
    </div>
  );
}
