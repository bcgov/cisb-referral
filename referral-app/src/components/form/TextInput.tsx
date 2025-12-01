import type { UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  id: string;
  registration: UseFormRegisterReturn;
  type?: "text" | "email" | "tel" | "date";
}

export function TextInput({ id, registration, type = "text" }: TextInputProps) {
  return <input id={id} type={type} {...registration} />;
}

interface TextAreaProps {
  id: string;
  registration: UseFormRegisterReturn;
  rows?: number;
}

export function TextArea({ id, registration, rows = 4 }: TextAreaProps) {
  return <textarea id={id} rows={rows} {...registration} />;
}
