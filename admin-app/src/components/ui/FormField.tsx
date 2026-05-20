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
    if (Number.isNaN(d.getTime())) return "";
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

interface DateTimeInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
}

export function DateTimeInput({
  label,
  value,
  onChange,
}: Readonly<DateTimeInputProps>) {
  const formatDateTimeForInput = (date: string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <FormField label={label}>
      <input
        type="datetime-local"
        value={formatDateTimeForInput(value)}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            onChange(null);
            return;
          }
          onChange(new Date(val).toISOString());
        }}
        className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
      />
    </FormField>
  );
}

interface SelectInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
  readonly options: readonly {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
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
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface TextAreaInputProps {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly onChange: (value: string | null) => void;
  readonly rows?: number;
  readonly fullWidth?: boolean;
}

export function TextAreaInput({
  label,
  value,
  onChange,
  rows = 5,
  fullWidth = false,
}: Readonly<TextAreaInputProps>) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-bcgov-gray-dark mb-1">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        rows={rows}
        className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue resize-y"
      />
    </div>
  );
}

interface ReadOnlyFieldProps {
  readonly label: string;
  readonly value: string | null | undefined;
}

export function ReadOnlyField({ label, value }: Readonly<ReadOnlyFieldProps>) {
  return (
    <FormField label={label}>
      <input
        type="text"
        value={value || "—"}
        disabled
        className="w-full px-3 py-2 border border-bcgov-border rounded bg-gray-100 text-bcgov-gray"
      />
    </FormField>
  );
}
