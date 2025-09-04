// Service for fetching and (optionally) loading local ride match index JSON
// Keep framework-agnostic logic here.

export type MatchIndex = {
  version: number;
  generatedAt: string;
  timezone: string;
  days: {
    date: string;
    courses: {
      course: string;
      program: string | null;
      firstStartMin: number;
      lastEndMin: number;
    }[];
  }[];
};

export const DEFAULT_RIDES_URL: string =
  (process.env.EXPO_PUBLIC_RIDES_URL as string) ||
  'https://data.apps.szi.dhbw-loerrach.de/courses-rides.json';

export type RidesSource = 'file' | 'remote';

/**
 * Returns the selected source for rides JSON based on env.
 * Env: EXPO_PUBLIC_RIDES_SOURCE=file | remote (default: remote)
 */
export function getRidesSource(): RidesSource {
  const src = String(process.env.EXPO_PUBLIC_RIDES_SOURCE || '')
    .trim()
    .toLowerCase();
  return src === 'file' ? 'file' : 'remote';
}

/**
 * Fetch the courses->rides match index from remote.
 */
export async function fetchMatchIndexFromRemote(
  url: string = DEFAULT_RIDES_URL,
  opts?: { signal?: AbortSignal }
): Promise<MatchIndex> {
  const res = await fetch(url, { signal: opts?.signal });
  if (!res.ok) {
    throw new Error(
      `Rides JSON fetch error: ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as MatchIndex;
}

/**
 * Debug helper: try to load a locally generated JSON file.
 * Will return null if the file is missing (e.g., in production builds).
 */
export function loadLocalMatchIndex(): MatchIndex | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require('../scripts/courses-rides.json');
    return data as MatchIndex;
  } catch {
    return null;
  }
}
