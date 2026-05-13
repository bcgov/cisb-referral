interface FieldErrorProps {
  readonly message?: unknown;
}

/**
 * Renders a validation error message in red below a form field.
 * Intended to be used by form wrapper components (TextInput, SelectField, etc.)
 * that get their error state from react-hook-form's useController.
 */
export function FieldError({ message }: Readonly<FieldErrorProps>) {
  let normalizedMessage: string | undefined;
  if (typeof message === "string") {
    normalizedMessage = message;
  } else if (typeof message === "number") {
    normalizedMessage = String(message);
  }

  if (!normalizedMessage) return null;

  return (
    <span className="field-error" role="alert">
      {normalizedMessage}
    </span>
  );
}
