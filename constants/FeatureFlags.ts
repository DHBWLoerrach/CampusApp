// Centralized feature flags for toggling UI/features at runtime.
// Values are read from Expo public env vars (inlined at build time).

function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
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
  false,
);
