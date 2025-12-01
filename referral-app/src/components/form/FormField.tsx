import type { FieldError } from "react-hook-form";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: FieldError;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>
        {label}
        {required && " *"}
      </label>
      {children}
      {error && <span className="error">{error.message}</span>}
    </div>
  );
}
