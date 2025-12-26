// Central alias table for course names. Keys and values should be maintained in lowercase.
// Example: 'wwi25a' is an alias and refers to the canonical course name 'wwi25a-am'.
export const COURSE_ALIAS_MAP: Record<string, string> = {
  wwi23a: "wwi23a-am",
  wwi23b: "wwi23b-am",
  wwi25a: "wwi25a-am",
  wwi25b: "wwi25b-am",
};

/**
 * Normalizes the input value (trim + lowercase) and resolves known aliases
 * to a canonical course name. If no alias is found, the normalized input
 * value is returned.
 */
export function resolveCourseAlias(input: string): string {
  const norm = input.trim().toLowerCase();
  return COURSE_ALIAS_MAP[norm] ?? norm;
}
