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

export function formatSupports(supports: string[]): string {
  if (!supports || supports.length === 0) return "—";
  return supports.map((s) => supportLabels[s] || s).join(", ");
}

export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export function calculateTriageTime(
  createdAt: string,
  assignedOn: string | null
): string {
  if (!assignedOn) return "—";
  const created = new Date(createdAt);
  const assigned = new Date(assignedOn);
  const hours = Math.round(
    (assigned.getTime() - created.getTime()) / (1000 * 60 * 60)
  );
  return `${hours} hours`;
}

export function calculateContactTime(
  assignedOn: string | null,
  firstContactMadeOn: string | null
): string {
  if (!assignedOn || !firstContactMadeOn) return "—";
  const assigned = new Date(assignedOn);
  const contacted = new Date(firstContactMadeOn);
  const hours = Math.round(
    (contacted.getTime() - assigned.getTime()) / (1000 * 60 * 60)
  );
  return `${hours} hours`;
}
