interface FieldGridProps {
  children: React.ReactNode;
}

export function FieldGrid({ children }: FieldGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-8">
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}

export function Field({ label, value, fullWidth = false }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-bcgov-gray uppercase tracking-wide">
        {label}
      </label>
      <span className="text-sm text-bcgov-gray-dark p-2 bg-gray-50 border border-gray-200 rounded min-h-9">
        {value || "—"}
      </span>
    </div>
  );
}
