// Centralized keys for Expo SQLite KV storage
// Keep keys stable to preserve user data across updates

export const LAST_TAB_KEY = "lastTab";
// When the last tab is the schedule, remember which sub-tab was active
export const LAST_SCHEDULE_SUBTAB_KEY = "lastScheduleSubtab";
// Hide the CodeCompanion promo permanently after the user dismisses it once
export const CODE_COMPANION_PROMO_DISMISSED_KEY =
  "codeCompanionPromoDismissed";
// Count how often the CodeCompanion promo has been opened
export const CODE_COMPANION_PROMO_SEEN_COUNT_KEY = "codeCompanionPromoSeenCount";
