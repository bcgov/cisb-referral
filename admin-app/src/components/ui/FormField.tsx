interface FormFieldProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

export function FormField({ label, children }: Readonly<FormFieldProps>) {
  return (
    <div>
      <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

interface TextInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
  readonly type?: "text" | "email" | "tel";
  readonly required?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: Readonly<TextInputProps>) {
  return (
    <FormField label={label}>
      <input
        type={type}
        value={value || ""}
        onChange={(e) =>
          onChange(required ? e.target.value : e.target.value || null)
        }
        className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
      />
    </FormField>
  );
}

interface DateInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
}

export function DateInput({
  label,
  value,
  onChange,
}: Readonly<DateInputProps>) {
  const formatDateForInput = (date: string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  return (
    <FormField label={label}>
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
      />
    </FormField>
  );
}

interface SelectInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
  readonly options: readonly { value: string; label: string }[];
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: Readonly<SelectInputProps>) {
  return (
    <FormField label={label}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
