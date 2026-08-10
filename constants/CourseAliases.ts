// Central alias table for course names. Keys and values should be maintained in lowercase.
// Example: 'wwi25a' is an alias and refers to the canonical course name 'wwi25a-am'.
export const COURSE_ALIAS_MAP: Record<string, string> = {
  wwi23a: 'wwi23a-am',
  wwi23b: 'wwi23b-am',
  wwi25a: 'wwi25a-am',
  wwi25b: 'wwi25b-am',
  wwi26a: 'wwi26a-am',
  wwi26b: 'wwi26b-am',
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

// Reverse lookup table, built once from COURSE_ALIAS_MAP.
const COURSE_ALIAS_REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COURSE_ALIAS_MAP).map(([alias, canonical]) => [
    canonical,
    alias,
  ])
);

/**
 * Inverse of `resolveCourseAlias`: maps a canonical course name back to the
 * plain course designation students use (e.g. 'wwi25a-am' -> 'wwi25a').
 *
 * The canonical names exist only to address the OWA mailboxes behind the iCal
 * feed. Services that key on the official course code need the plain form.
 */
export function unresolveCourseAlias(input: string): string {
  const norm = input.trim().toLowerCase();
  return COURSE_ALIAS_REVERSE_MAP[norm] ?? norm;
}
