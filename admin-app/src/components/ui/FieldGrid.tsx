interface FieldGridProps {
  readonly children: React.ReactNode;
  readonly columns?: 2 | 3;
}

export function FieldGrid({ children, columns = 2 }: Readonly<FieldGridProps>) {
  const gridCols =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return <div className={`grid ${gridCols} gap-4 gap-x-8`}>{children}</div>;
}

interface FieldProps {
  readonly label: string;
  readonly value?: string | null;
  readonly fullWidth?: boolean;
}

export function Field({
  label,
  value,
  fullWidth = false,
}: Readonly<FieldProps>) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-bcgov-gray uppercase tracking-wide">
        {label}
      </label>
      <span className="text-sm text-bcgov-gray-dark p-2 bg-gray-100 border border-bcgov-border rounded min-h-9">
        {value || "—"}
      </span>
    </div>
  );
}
