import type { ReactNode } from "react";

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

/**
 * Simple wrapper for form field layout consistency.
 * BC Gov components handle their own labels, errors, and descriptions.
 */
export function FormField({ children, className = "" }: FormFieldProps) {
  return <div className={`form-field ${className}`.trim()}>{children}</div>;
}
