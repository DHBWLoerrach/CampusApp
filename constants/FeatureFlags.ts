// Centralized feature flags for toggling UI/features at runtime.
// Values are read from Expo public env vars (inlined at build time).

function parseBoolEnv(
  value: string | undefined,
  defaultValue: boolean
): boolean {
  if (!value) return defaultValue;
  const v = value.trim().toLowerCase();
  if (['false', '0', 'off', 'no'].includes(v)) return false;
  if (['true', '1', 'on', 'yes'].includes(v)) return true;
  return defaultValue;
}

// Hide/Show the rides (carpool) UI entry in the Schedule header.
// EXPO_PUBLIC_RIDES_ENABLED=false will hide the icon.
export const RIDES_FEATURE_ENABLED: boolean = parseBoolEnv(
  process.env.EXPO_PUBLIC_RIDES_ENABLED as string | undefined,
  false
);

// Hide/Show the block plan (Blockplan) UI entry in the Schedule header.
// Defaults to off: while the plan API is not live, every schedule visit would
// otherwise spend a failing request plus retries on it.
// EXPO_PUBLIC_BLOCKPLAN_ENABLED=true will enable the lookup and the icon.
export const BLOCK_PLAN_FEATURE_ENABLED: boolean = parseBoolEnv(
  process.env.EXPO_PUBLIC_BLOCKPLAN_ENABLED as string | undefined,
  false
);
