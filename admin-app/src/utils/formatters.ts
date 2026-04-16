import { supportLabels } from "../constants";

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSupports(supports: string[]): string {
  if (!supports || supports.length === 0) return "—";
  return supports.map((s) => supportLabels[s] || s).join(", ");
}

export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined) return "—";
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hours`;
}
