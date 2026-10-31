// Minimum window width (dp) of the "medium" Android window size class: unfolded
// foldable inner displays and tablets in portrait. Below this width the window
// is a regular phone in portrait.
// https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
export const MEDIUM_WINDOW_MIN_WIDTH = 600;

// For TopTabs inside a SafeAreaView: the view already keeps them clear of side
// insets, so the tab bar must not pad its tabs by those insets a second time.
export const TOP_TABS_SAFE_AREA_INSETS = { left: 0, right: 0 };
