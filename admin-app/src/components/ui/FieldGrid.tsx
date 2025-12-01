import "./FieldGrid.css";

interface FieldGridProps {
  children: React.ReactNode;
}

export function FieldGrid({ children }: FieldGridProps) {
  return <div className="field-grid">{children}</div>;
}

interface FieldProps {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}

export function Field({ label, value, fullWidth = false }: FieldProps) {
  return (
    <div className={`field ${fullWidth ? "full-width" : ""}`}>
      <label>{label}</label>
      <span className="field-value">{value || "—"}</span>
    </div>
  );
}
