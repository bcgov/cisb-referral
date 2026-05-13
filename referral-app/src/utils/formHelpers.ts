import type { SelectOption } from "../types";

export type OptionsType = readonly string[] | readonly SelectOption[];

export function isStringArray(
  options: OptionsType,
): options is readonly string[] {
  return options.length === 0 || typeof options[0] === "string";
}

export function isOtherLookupOption(name: string | undefined): boolean {
  return name?.trim().toLowerCase() === "other";
}
