import type { UpdateReferralDto } from "../types";

/**
 * Compares current form data against the initial referral values
 * and returns only the fields that have changed.
 */
export function getChangedFields(
  formData: UpdateReferralDto,
  initial: UpdateReferralDto,
): Partial<UpdateReferralDto> {
  const changed: Partial<UpdateReferralDto> = {};

  for (const key of Object.keys(formData) as (keyof UpdateReferralDto)[]) {
    const current = formData[key];
    const original = initial[key];

    if (Array.isArray(current) && Array.isArray(original)) {
      if (
        current.length !== original.length ||
        current.some((v, i) => v !== original[i])
      ) {
        (changed as Record<string, unknown>)[key] = current;
      }
    } else if (current !== original) {
      (changed as Record<string, unknown>)[key] = current;
    }
  }

  return changed;
}
