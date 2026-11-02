// Minimum window width (dp) of the "medium" Android window size class: unfolded
// foldable inner displays and tablets in portrait. Below this width the window
// is a regular phone in portrait.
// https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
export const MEDIUM_WINDOW_MIN_WIDTH = 600;

// Maximum width (dp) of text-heavy content such as lists, cards, and forms.
// On wide windows (unfolded foldables, tablets) lines spanning the full width
// get hard to read, so the content stops growing here and is centered.
// Narrower windows are unaffected because the content never reaches it.
export const READABLE_CONTENT_MAX_WIDTH = 680;

// Spread into a content container style (one without horizontal margins,
// since a full width plus margins would overflow its parent).
export const READABLE_CONTENT = {
  width: '100%',
  maxWidth: READABLE_CONTENT_MAX_WIDTH,
  alignSelf: 'center',
} as const;

// For TopTabs inside a SafeAreaView: the view already keeps them clear of side
// insets, so the tab bar must not pad its tabs by those insets a second time.
export const TOP_TABS_SAFE_AREA_INSETS = { left: 0, right: 0 };
