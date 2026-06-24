# Code Companion Banner Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blue chat-bubble Code Companion promo banner with a tappable white card, remove the intrusive auto-popup, and delete the now-unused `seenCount` mechanism.

**Architecture:** The schedule layout (`app/(tabs)/schedule/(sections)/_layout.tsx`) renders a promo banner above the schedule list and a `BottomSheet` with the full promo. We extract the banner into its own focused component, drop the auto-popup effect, and simplify the promo state to a single persisted `dismissed` flag. The sheet always offers both a permanent-dismiss and a close action.

**Tech Stack:** React Native, Expo Router, TypeScript (strict), Jest + React Native Testing Library (`jest-expo` preset).

## Global Constraints

- TypeScript strict mode; 2-space indentation.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`).
- Code comments in English only.
- Eligible course prefixes stay exactly: `TIF`, `WDS`, `WWI`.
- The only persisted promo state after this work is the `dismissed` flag
  (`codeCompanionPromoDismissed`). No seen-count storage.
- Banner copy — Title: `DHBW Code Companion`; Subtitle: `Quizfragen · Lernpfade · Lernfortschritt`.
- Banner card style must match `LectureCard`: `borderRadius: 8`,
  `borderCurve: 'continuous'`, `borderWidth: 1`, `padding: 12`, background from the
  `background` theme color, border from the `border` theme color.
- Before finishing: `npm run format`, `npx tsc --noEmit`, `npm run lint`,
  `npm run test` must all pass.

---

### Task 1: Remove the `seenCount` mechanism from the promo lib

The new logic never reads or writes a seen counter, so delete it from storage keys,
the lib, and the lib tests.

**Files:**
- Modify: `constants/StorageKeys.ts:9-11`
- Modify: `lib/codeCompanionPromo.ts:1-9,35-66`
- Test: `__tests__/lib/codeCompanionPromo.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `lib/codeCompanionPromo.ts` exports after this task are
  `CODE_COMPANION_ELIGIBLE_PREFIXES` (internal), `CODE_COMPANION_ANDROID_URL`,
  `CODE_COMPANION_IOS_URL`, `CODE_COMPANION_FEATURES`,
  `isCodeCompanionEligibleCourse(course)`,
  `getCodeCompanionPromoDismissed(): Promise<boolean>`,
  `dismissCodeCompanionPromo(): Promise<void>`. The symbols
  `CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD`,
  `getCodeCompanionPromoSeenCount`, `incrementCodeCompanionPromoSeenCount`, and
  `CODE_COMPANION_PROMO_SEEN_COUNT_KEY` no longer exist.

- [ ] **Step 1: Remove the seen-count test cases**

In `__tests__/lib/codeCompanionPromo.test.ts`, change the imports to drop the removed
symbols. The import block becomes:

```ts
import {
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
import { CODE_COMPANION_PROMO_DISMISSED_KEY } from '@/constants/StorageKeys';
```

Delete these three test cases entirely from the `storage helpers` describe block:
`treats a missing seen counter as zero`, `normalizes invalid seen counter values to
zero`, `increments the seen counter via a storage update function`, and `exposes the
permanent dismiss threshold as a named constant`. Keep `treats a missing dismissed
flag as not dismissed` and `stores the permanent dismiss flag`.

- [ ] **Step 2: Remove seen-count code from the lib**

Replace the full contents of `lib/codeCompanionPromo.ts` with:

```ts
import Storage from 'expo-sqlite/kv-store';
import { resolveCourseAlias } from '@/constants/CourseAliases';
import { CODE_COMPANION_PROMO_DISMISSED_KEY } from '@/constants/StorageKeys';

const CODE_COMPANION_ELIGIBLE_PREFIXES = ['TIF', 'WDS', 'WWI'] as const;

export const CODE_COMPANION_ANDROID_URL =
  'https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.CodeCompanion';
export const CODE_COMPANION_IOS_URL =
  'https://apps.apple.com/app/dhbw-code-companion/id6758941958';

export const CODE_COMPANION_FEATURES = [
  'Lernpfade mit kurzen Erklärungen',
  'KI-Quizfragen zum Üben und Wiederholen',
  'Lernfortschritt mit Levels und Mastery je Thema',
] as const;

export function isCodeCompanionEligibleCourse(
  course: string | null | undefined
): boolean {
  if (!course?.trim()) {
    return false;
  }

  const canonicalCourse = resolveCourseAlias(course).trim().toUpperCase();
  return CODE_COMPANION_ELIGIBLE_PREFIXES.some((prefix) =>
    canonicalCourse.startsWith(prefix)
  );
}

export async function getCodeCompanionPromoDismissed(): Promise<boolean> {
  const savedDismissed = await Storage.getItem(
    CODE_COMPANION_PROMO_DISMISSED_KEY
  );
  return savedDismissed === '1';
}

export async function dismissCodeCompanionPromo(): Promise<void> {
  await Storage.setItem(CODE_COMPANION_PROMO_DISMISSED_KEY, '1');
}
```

- [ ] **Step 3: Remove the seen-count storage key**

In `constants/StorageKeys.ts`, delete the comment and constant for the seen counter
(lines 9-11), leaving the file ending at the dismissed key:

```ts
// Centralized keys for Expo SQLite KV storage
// Keep keys stable to preserve user data across updates

export const LAST_TAB_KEY = 'lastTab';
// When the last tab is the schedule, remember which sub-tab was active
export const LAST_SCHEDULE_SUBTAB_KEY = 'lastScheduleSubtab';
// Hide the CodeCompanion promo permanently after the user dismisses it once
export const CODE_COMPANION_PROMO_DISMISSED_KEY = 'codeCompanionPromoDismissed';
```

- [ ] **Step 4: Run the lib tests**

Run: `npm run test -- codeCompanionPromo`
Expected: PASS, no references to removed symbols.

- [ ] **Step 5: Commit**

```bash
git add lib/codeCompanionPromo.ts constants/StorageKeys.ts __tests__/lib/codeCompanionPromo.test.ts
git commit -m "Remove unused Code Companion promo seen-count mechanism"
```

---

### Task 2: Sheet always shows both action buttons

Drop the `canHideForever` prop and the either/or branching; render both "Nicht mehr
automatisch anzeigen" (permanent dismiss) and "Schließen" (close once) stacked.

**Files:**
- Modify: `components/schedule/CodeCompanionPromoSheetContent.tsx:18-22,67-78,150-179`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `CodeCompanionPromoSheetContent` now takes
  `{ onClose: () => void; onHideForever: () => void }` (no `canHideForever`).
  `CodeCompanionPromoSheetTitle` is unchanged.

- [ ] **Step 1: Update the props type**

In `components/schedule/CodeCompanionPromoSheetContent.tsx`, replace the
`CodeCompanionPromoSheetContentProps` interface (currently lines 18-22) with:

```ts
interface CodeCompanionPromoSheetContentProps {
  onClose: () => void;
  onHideForever: () => void;
}
```

- [ ] **Step 2: Update the component signature**

Replace the default export signature (currently destructuring `canHideForever`) with:

```ts
export default function CodeCompanionPromoSheetContent({
  onClose,
  onHideForever,
}: CodeCompanionPromoSheetContentProps) {
```

- [ ] **Step 3: Always render both buttons**

In the `actions` `View`, replace the `{canHideForever ? (...) : (...)}` ternary (the
block rendering either the hide-forever button or the close button) with both buttons
rendered unconditionally, hide-forever first:

```tsx
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onHideForever}
          accessibilityRole="button"
          accessibilityLabel="Code Companion-Hinweis nicht mehr automatisch anzeigen"
          accessibilityHint="Blendet diesen Hinweis dauerhaft aus"
        >
          <ThemedText
            style={[styles.dismissButtonText, { color: secondaryTextColor }]}
          >
            Nicht mehr automatisch anzeigen
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Code Companion-Hinweis schließen"
          accessibilityHint="Schließt diesen Hinweis"
        >
          <ThemedText
            style={[styles.dismissButtonText, { color: secondaryTextColor }]}
          >
            Schließen
          </ThemedText>
        </TouchableOpacity>
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (the only remaining `canHideForever` reference is in `_layout.tsx`,
fixed in Task 4 — if running standalone, expect that one error here; it clears after
Task 4).

- [ ] **Step 5: Commit**

```bash
git add components/schedule/CodeCompanionPromoSheetContent.tsx
git commit -m "Always show both close and permanent-dismiss in Code Companion sheet"
```

---

### Task 3: Create the `CodeCompanionPromoBanner` component

A white card matching the appointment cards: framed app icon, title + subtitle, and a
trailing chevron to signal it is tappable.

**Files:**
- Create: `components/schedule/CodeCompanionPromoBanner.tsx`
- Test: `__tests__/components/schedule/CodeCompanionPromoBanner.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `export default function CodeCompanionPromoBanner({ onPress }: { onPress: () => void })`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/schedule/CodeCompanionPromoBanner.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import CodeCompanionPromoBanner from '@/components/schedule/CodeCompanionPromoBanner';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#ffffff',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('CodeCompanionPromoBanner', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = render(<CodeCompanionPromoBanner onPress={() => {}} />);

    expect(getByText('DHBW Code Companion')).toBeTruthy();
    expect(getByText('Quizfragen · Lernpfade · Lernfortschritt')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <CodeCompanionPromoBanner onPress={onPress} />
    );

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- CodeCompanionPromoBanner`
Expected: FAIL — `Cannot find module '@/components/schedule/CodeCompanionPromoBanner'`.

- [ ] **Step 3: Implement the component**

Create `components/schedule/CodeCompanionPromoBanner.tsx`:

```tsx
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

const CODE_COMPANION_ICON = require('../../assets/images/codecompanion.png');

interface CodeCompanionPromoBannerProps {
  onPress: () => void;
}

export default function CodeCompanionPromoBanner({
  onPress,
}: CodeCompanionPromoBannerProps) {
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="DHBW Code Companion öffnen"
      accessibilityHint="Öffnet den Hinweis zu DHBW Code Companion"
      style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
    >
      <View style={[styles.iconFrame, { backgroundColor: cardBackground, borderColor }]}>
        <Image
          source={CODE_COMPANION_ICON}
          style={styles.icon}
          accessibilityRole="image"
          accessibilityLabel="App-Icon von DHBW Code Companion"
        />
      </View>

      <View style={styles.texts}>
        <ThemedText style={styles.title}>DHBW Code Companion</ThemedText>
        <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
          Quizfragen · Lernpfade · Lernfortschritt
        </ThemedText>
      </View>

      <IconSymbol name="chevron.right" size={18} color={secondaryTextColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  iconFrame: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- CodeCompanionPromoBanner`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add components/schedule/CodeCompanionPromoBanner.tsx __tests__/components/schedule/CodeCompanionPromoBanner.test.tsx
git commit -m "Add CodeCompanionPromoBanner card component"
```

---

### Task 4: Wire the banner into the schedule layout and remove the auto-popup

Replace the inline blue pill with the new banner, delete the auto-popup, drop all
seen-count state, and stop passing `canHideForever`.

**Files:**
- Modify: `app/(tabs)/schedule/(sections)/_layout.tsx`
- Test: `__tests__/components/schedule/ScheduleLayout.test.tsx`

**Interfaces:**
- Consumes: `CodeCompanionPromoBanner` (Task 3),
  `CodeCompanionPromoSheetContent` without `canHideForever` (Task 2),
  `getCodeCompanionPromoDismissed` / `dismissCodeCompanionPromo` /
  `isCodeCompanionEligibleCourse` (Task 1).
- Produces: the schedule layout's promo behavior — no auto-popup, banner visible for
  eligible + non-dismissed courses, sheet opens on banner tap.

- [ ] **Step 1: Update the layout test for the new behavior**

Replace the whole contents of `__tests__/components/schedule/ScheduleLayout.test.tsx`
with:

```tsx
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ScheduleLayout from '@/app/(tabs)/schedule/(sections)/_layout';

const mockStorageGetItem = jest.fn();
const mockUseCourseContext = jest.fn();
const mockGetDismissed = jest.fn();
const mockDismissPromo = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockStorageGetItem(...args),
  setItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useIsFocused: () => true,
  withLayoutContext: (Navigator: any) => Navigator,
}));

jest.mock('expo-router/js-top-tabs', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MaterialTopTabBar = () => <Text>TopTabBar</Text>;
  const Navigator = ({ children, tabBar }: any) => (
    <View>
      {tabBar
        ? tabBar({
            state: {} as any,
            descriptors: {} as any,
            navigation: {} as any,
            position: {} as any,
          })
        : null}
      {children}
    </View>
  );

  Navigator.Screen = ({ children }: any) => <View>{children}</View>;

  return {
    createMaterialTopTabNavigator: () => ({ Navigator }),
    MaterialTopTabBar,
  };
});

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: (_props: unknown, colorName: string) =>
    (
      ({
        background: '#ffffff',
        border: '#d0d0d0',
        dayNumberContainer: '#eef5ff',
        icon: '#687076',
        text: '#11181c',
      }) as Record<string, string>
    )[colorName] ?? '#11181c',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('@/context/CourseContext', () => ({
  useCourseContext: () => mockUseCourseContext(),
}));

jest.mock('@/lib/codeCompanionPromo', () => {
  const actual = jest.requireActual('@/lib/codeCompanionPromo');
  return {
    ...actual,
    getCodeCompanionPromoDismissed: (...args: unknown[]) =>
      mockGetDismissed(...args),
    dismissCodeCompanionPromo: (...args: unknown[]) => mockDismissPromo(...args),
  };
});

jest.mock('@/components/ui/BottomSheet', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    __esModule: true,
    default: ({ visible, title, titleContent, children }: any) =>
      visible ? (
        <View>
          {titleContent ?? <Text>{title}</Text>}
          {children}
        </View>
      ) : null,
  };
});

jest.mock('@/components/schedule/CourseSetup', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/TopTabLabel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ScheduleLayout Code Companion promo', () => {
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorageGetItem.mockReset();
    mockUseCourseContext.mockReset();
    mockGetDismissed.mockReset();
    mockDismissPromo.mockReset();

    mockStorageGetItem.mockResolvedValue('index');
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'TIF24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });
    mockGetDismissed.mockResolvedValue(false);
    mockDismissPromo.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('shows the banner for an eligible course without auto-opening the sheet', async () => {
    const { getByText, queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByText('DHBW Code Companion')).toBeTruthy();
    });

    // Sheet content is not rendered until the banner is tapped.
    expect(queryByText('Nicht mehr automatisch anzeigen')).toBeNull();
  });

  it('does not show the banner for ineligible courses', async () => {
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'BWL24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('does not show the banner when permanently dismissed', async () => {
    mockGetDismissed.mockResolvedValue(true);

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('opens the sheet with both actions when the banner is tapped', async () => {
    const { getByLabelText, getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });
    expect(getByText('Schließen')).toBeTruthy();
  });

  it('restores the banner when permanent dismiss persistence fails', async () => {
    mockDismissPromo.mockRejectedValueOnce(new Error('storage failed'));

    const { getByLabelText, getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });

    fireEvent.press(getByText('Nicht mehr automatisch anzeigen'));

    await waitFor(() => {
      expect(mockDismissPromo).toHaveBeenCalledTimes(1);
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- ScheduleLayout`
Expected: FAIL — the current layout still auto-opens the sheet and renders the old
blue pill text, so the new assertions (no auto-open, banner label present) fail.

- [ ] **Step 3: Update the imports in the layout**

In `app/(tabs)/schedule/(sections)/_layout.tsx`:

Change the `react-native` import (line 9) to drop `StyleSheet` and `TouchableOpacity`:

```ts
import { View } from 'react-native';
```

Remove the `ThemedText` import (line 20) and the `useThemeColor` import (line 32).

Add the banner import next to the other schedule component imports:

```ts
import CodeCompanionPromoBanner from '@/components/schedule/CodeCompanionPromoBanner';
```

Replace the `@/lib/codeCompanionPromo` import block (lines 23-30) with:

```ts
import {
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
```

- [ ] **Step 4: Remove seen-count state and blue color hooks**

Delete the `promoSeenCount` state line (`const [promoSeenCount, setPromoSeenCount] =
useState<number | null>(null);`) and the two color hooks `reopenBackground` and
`reopenTextColor` (the `useThemeColor({ light: '#EAF3FF', ... })` and
`useThemeColor({ light: '#2A5D9F', ... })` blocks).

- [ ] **Step 5: Simplify `showPromo`**

Replace the `showPromo` callback with (no seen-count increment):

```tsx
  const showPromo = useCallback(() => {
    if (promoDismissed !== false || !isEligibleCourse || promoOpenRef.current) {
      return;
    }

    promoOpenRef.current = true;
    setPromoOpen(true);
  }, [isEligibleCourse, promoDismissed]);
```

- [ ] **Step 6: Simplify the promo-state load effect**

Replace the effect that loads `[dismissed, seenCount]` with one that loads only the
dismissed flag:

```tsx
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const dismissed = await getCodeCompanionPromoDismissed();
        if (mounted) {
          setPromoDismissed(dismissed);
        }
      } catch (error) {
        console.warn('Failed to load Code Companion promo state:', error);
        if (mounted) {
          setPromoDismissed(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
```

- [ ] **Step 7: Remove the auto-popup from the focus effect**

Replace the focus effect (the one starting `useEffect(() => { if (!isFocused) {`)
with a version that no longer auto-opens and guards on `promoDismissed`:

```tsx
  useEffect(() => {
    if (!isFocused) {
      promoOpenRef.current = false;
      return;
    }

    if (isLoading || promoDismissed === null) {
      return;
    }

    if (promoDismissed === true || !isEligibleCourse) {
      if (promoOpen) {
        // Close the sheet when the selected course can no longer show this promo.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPromoOpen(false);
      }
      promoOpenRef.current = false;
    }
  }, [isEligibleCourse, isFocused, isLoading, promoDismissed, promoOpen]);
```

- [ ] **Step 8: Simplify the banner visibility condition**

Replace the `showPromoReopen` definition with (no seen-count gate):

```tsx
  const showPromoReopen =
    !promoOpen && promoDismissed === false && isEligibleCourse;
```

- [ ] **Step 9: Render the new banner in the tab bar**

Replace the inline `<TouchableOpacity ...>...Kennst du schon...</TouchableOpacity>`
block inside `renderTabBar` with the new component, and update the `useCallback`
dependency array to drop the removed color values:

```tsx
  const renderTabBar = useCallback(
    (props: MaterialTopTabBarProps) => (
      <View>
        <MaterialTopTabBar {...props} />
        {showPromoReopen ? (
          <CodeCompanionPromoBanner onPress={showPromo} />
        ) : null}
      </View>
    ),
    [showPromo, showPromoReopen]
  );
```

- [ ] **Step 10: Drop `canHideForever` wiring and the old styles**

Delete the `canHidePromoForever` variable (the
`(promoSeenCount ?? 0) >= CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD` line) and the
`canHideForever={canHidePromoForever}` prop on `<CodeCompanionPromoSheetContent>`, so
the sheet usage becomes:

```tsx
          <CodeCompanionPromoSheetContent
            onClose={closePromo}
            onHideForever={() => {
              void dismissPromoForever();
            }}
          />
```

Delete the entire `const styles = StyleSheet.create({ reopenBanner: ..., reopenBannerText: ... });`
block at the bottom of the file.

- [ ] **Step 11: Run the layout test to verify it passes**

Run: `npm run test -- ScheduleLayout`
Expected: PASS (all five tests).

- [ ] **Step 12: Commit**

```bash
git add "app/(tabs)/schedule/(sections)/_layout.tsx" __tests__/components/schedule/ScheduleLayout.test.tsx
git commit -m "Replace Code Companion pill with card banner, remove auto-popup"
```

---

### Task 5: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Format**

Run: `npm run format`
Expected: files formatted, no diff to commit beyond formatting; if anything changes,
include it in the next commit.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS, no errors (in particular, no leftover `canHideForever` /
`promoSeenCount` / `CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD` references).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS, no errors.

- [ ] **Step 4: Full test suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Manual smoke check (device/simulator)**

On iOS and Android, light and dark mode, with an eligible course (e.g. `TIF24A`):
- Open the schedule: the white card banner appears above the list, no popup.
- Tap the banner: the sheet opens showing both "Nicht mehr automatisch anzeigen" and
  "Schließen".
- Tap "Schließen": the sheet closes, the banner remains.
- Tap the banner again, tap "Nicht mehr automatisch anzeigen": the sheet closes and
  the banner is gone (and stays gone after navigating away and back).

- [ ] **Step 6: Commit any formatting changes**

```bash
git add -A
git commit -m "Apply formatting for Code Companion banner redesign" || echo "nothing to commit"
```

---

## Notes for the implementer

- The `dayNumberContainer` theme color is no longer used by the promo banner, but it
  may still be used elsewhere — do not remove it from the theme.
- `jest-expo` handles `require(...png)` and `@expo/vector-icons`, but the tests above
  mock `@/components/ui/IconSymbol` to keep them fast and deterministic.
- Keep the `swp` file `app/(tabs)/schedule/(sections)/.index.tsx.swp` out of commits.
