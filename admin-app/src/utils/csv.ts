/**
 * Quote a value for CSV (RFC 4180): wrap in quotes when it contains a comma,
 * quote, or newline; double any embedded quote.
 *
 * Also defangs leading characters Excel treats as a formula prefix
 * (=, +, -, @, tab, CR, LF) by prepending a single quote — without this,
 * a hostile portal submission in a name field
 * would execute when an admin opens the CSV.
 */
function escapeCell(value: string): string {
  let safe = value;
  if (safe.length > 0 && /^[=+\-@\t\r\n]/.test(safe)) {
    safe = `'${safe}`;
  }
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replaceAll('"', '""')}"`;
  }
  return safe;
}

export function toCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCell).join(",");
  const bodyLines = rows.map((row) => row.map(escapeCell).join(","));
  return [headerLine, ...bodyLines].join("\r\n");
}

/** Trigger a browser download of a CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
