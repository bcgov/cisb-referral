/**
 * Compares two objects and returns an array of changed fields.
 * Values are serialized to strings for consistent audit storage.
 */
export interface FieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

/**
 * Compares old and new objects for the given tracked fields.
 * Returns an array of changes where the value actually differs.
 */
export function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  trackedFields: string[],
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const field of trackedFields) {
    if (!Object.hasOwn(newObj, field)) {
      continue;
    }

    const oldVal = oldObj[field];
    const newVal = newObj[field];

    const oldStr = serializeValue(oldVal);
    const newStr = serializeValue(newVal);

    if (oldStr !== newStr) {
      changes.push({
        field,
        oldValue: oldStr,
        newValue: newStr,
      });
    }
  }

  return changes;
}

/**
 * Serializes a value to a string for audit log storage.
 * Arrays are JSON-serialized; null/undefined become null.
 */
export function serializeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object' || Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return String(value);
}
