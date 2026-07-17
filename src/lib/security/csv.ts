/**
 * Guard spreadsheet formula injection when exporting CSV cells.
 * Prefixes values that Excel/Sheets would treat as formulas.
 */
export function sanitizeCsvCell(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(raw)) {
    return `'${raw}`;
  }
  return raw;
}

export function toCsvRow(values: Array<string | number | null | undefined>): string {
  return values
    .map((value) => {
      const sanitized = sanitizeCsvCell(value);
      if (/[",\n\r]/.test(sanitized)) {
        return `"${sanitized.replace(/"/g, '""')}"`;
      }
      return sanitized;
    })
    .join(",");
}
