# Android NFC Form Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the Android CampusCard NFC scanning hint and result in a native Expo Router form sheet instead of a centered JS `Modal`.

**Architecture:** A new form-sheet route (`app/(tabs)/canteen/nfc-sheet.tsx`) owns the NFC scan state machine (scanning → result | error). The Android `NfcButton` becomes a thin trigger that checks NFC availability and navigates to the sheet. iOS is untouched.

**Tech Stack:** Expo Router 56, react-native-screens 4.25.2 (`presentation: "formSheet"`), react-native-nfc-manager, Jest + React Native Testing Library.

## Global Constraints

- Android only. Do NOT modify `components/canteen/NfcButton.ios.tsx` or the iOS flow.
- No new dependencies. Use the already-installed `expo-router` form sheet.
- Code comments in English (project rule).
- Reference spec: `docs/superpowers/specs/2026-06-24-android-nfc-form-sheet-design.md`.
- After implementation, the whole change must pass: `npm run format`, `npx tsc --noEmit`, `npm run lint`, `npm run test`.
- NFC commands (verbatim): wake `[0x5a, 0x5f, 0x84, 0x15]`, balance `[0x6c, 0x1]`, last transaction `[0xf5, 0x1]`. Timeout 5000 ms.

---

### Task 1: Form-sheet route screen with NFC state machine

**Files:**
- Create: `app/(tabs)/canteen/nfc-sheet.tsx`
- Modify: `app/(tabs)/canteen/_layout.tsx` (add a `Stack.Screen` for `nfc-sheet`)

**Interfaces:**
- Consumes: `convertBytesToDouble(balanceBytes, lastTransactionBytes)` from `@/lib/nfcHelper` returning `{ balance, lastTransaction }`; `useThemeColor({}, key)` from `@/hooks/useThemeColor`.
- Produces: a navigable route at href `/canteen/nfc-sheet` rendered as a native form sheet. Task 2 navigates to it via `router.push('/canteen/nfc-sheet')`.

- [ ] **Step 1: Create the sheet screen**

Create `app/(tabs)/canteen/nfc-sheet.tsx`:

```tsx
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import convertBytesToDouble from '@/lib/nfcHelper';
import { useThemeColor } from '@/hooks/useThemeColor';

type ScanState =
  | { status: 'scanning' }
  | { status: 'result'; message: string }
  | { status: 'error'; message: string };

export default function NfcSheetScreen() {
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScanState>({ status: 'scanning' });

  useEffect(() => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;
    let cancelled = false;

    const scan = async () => {
      try {
        await NfcManager.cancelTechnologyRequest().catch(() => {});

        timeoutHandle = setTimeout(() => {
          timedOut = true;
          NfcManager.cancelTechnologyRequest().catch(() => {});
        }, 5000);

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        if (timedOut) throw new Error('timeout');
        if (timeoutHandle) clearTimeout(timeoutHandle);

        await NfcManager.transceive([0x5a, 0x5f, 0x84, 0x15]);
        const balanceBytes = await NfcManager.transceive([0x6c, 0x1]);
        const lastTransactionBytes = await NfcManager.transceive([0xf5, 0x1]);

        const { balance, lastTransaction } = convertBytesToDouble(
          balanceBytes,
          lastTransactionBytes
        );

        if (cancelled) return;
        setState({
          status: 'result',
          message: `Guthaben: ${balance}€\nLetzte Transaktion: ${lastTransaction}€\n(Angaben ohne Gewähr)`,
        });
      } catch (ex: any) {
        if (cancelled) return;
        if (timedOut) {
          setState({
            status: 'error',
            message: 'Zeitüberschreitung – keine CampusCard erkannt.',
          });
        } else {
          setState({
            status: 'error',
            message: 'NFC Fehler – bitte erneut versuchen.',
          });
          console.warn('NFC Fehler (Android):', ex);
        }
      }
    };

    scan();

    // Cleanup on unmount (swipe-dismiss, hardware back, or "Fertig" button)
    return () => {
      cancelled = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: background,
          paddingBottom: Math.max(16, insets.bottom + 12),
        },
      ]}
    >
      {state.status === 'scanning' ? (
        <>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.text, { color: textColor }]}>
            Halte deine CampusCard an das Gerät…
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.text, { color: textColor }]} selectable>
            {state.message}
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Sheet schließen"
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>Fertig</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Register the route as a form sheet**

In `app/(tabs)/canteen/_layout.tsx`, add a second `Stack.Screen` inside the existing `<Stack screenOptions={navBarOptions}>` block, right after the `(sections)` screen (around line 33, before `</Stack>`):

```tsx
        <Stack.Screen
          name="nfc-sheet"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.3],
            sheetGrabberVisible: true,
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
```

- [ ] **Step 3: Typecheck, lint, format**

Run: `npx tsc --noEmit && npm run lint && npm run format`
Expected: no type errors, no lint errors, files formatted.

- [ ] **Step 4: Manual smoke check (route resolves)**

Run the app on Android (`npm run android`) and confirm Metro bundles without
errors. Full scan behavior is verified in Task 2 once the trigger navigates.
(The screen is not reachable from the UI yet — this step only confirms the route
compiles and registers.)

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/canteen/nfc-sheet.tsx" "app/(tabs)/canteen/_layout.tsx"
git commit -m "Add Android NFC form sheet route"
```

---

### Task 2: Simplify Android NfcButton to navigate to the sheet

**Files:**
- Modify: `components/canteen/NfcButton.android.tsx` (replace entire file)
- Test: `__tests__/components/canteen/NfcButton.android.test.tsx`

**Interfaces:**
- Consumes: route `/canteen/nfc-sheet` from Task 1; `NfcTriggerCard` from `@/components/canteen/NfcTriggerCard`.
- Produces: `NfcButton` default export with props `{ render?: (args: { onPress: () => void; isScanning: boolean }) => ReactNode }`. `isScanning` is always `false` now (scan progress lives in the sheet). `onPress` shows an `Alert` when NFC is unavailable, otherwise calls `router.push('/canteen/nfc-sheet')`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/canteen/NfcButton.android.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';
import NfcButton from '@/components/canteen/NfcButton.android';

const mockIsSupported = jest.fn();
const mockIsEnabled = jest.fn();

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    isSupported: (...args: unknown[]) => mockIsSupported(...args),
    isEnabled: (...args: unknown[]) => mockIsEnabled(...args),
    start: jest.fn().mockResolvedValue(undefined),
  },
  NfcTech: { IsoDep: 'IsoDep' },
}));

const renderTrigger = ({ onPress }: { onPress: () => void }) => (
  <Text onPress={onPress}>scan</Text>
);

beforeEach(() => {
  jest.clearAllMocks();
});

it('navigates to the sheet when NFC is available', async () => {
  mockIsSupported.mockResolvedValue(true);
  mockIsEnabled.mockResolvedValue(true);

  const { getByText } = render(<NfcButton render={renderTrigger} />);
  fireEvent.press(getByText('scan'));

  await waitFor(() =>
    expect(router.push).toHaveBeenCalledWith('/canteen/nfc-sheet')
  );
});

it('shows an alert and does not navigate when NFC is unavailable', async () => {
  mockIsSupported.mockResolvedValue(true);
  mockIsEnabled.mockResolvedValue(false);
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getByText } = render(<NfcButton render={renderTrigger} />);
  fireEvent.press(getByText('scan'));

  await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  expect(router.push).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- NfcButton.android`
Expected: FAIL — the current `NfcButton.android.tsx` still renders a `Modal` and never calls `router.push`, so the first test fails on the `router.push` expectation.

- [ ] **Step 3: Replace `NfcButton.android.tsx` with the thin trigger**

Replace the entire contents of `components/canteen/NfcButton.android.tsx` with:

```tsx
import { ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import NfcManager from 'react-native-nfc-manager';
import NfcTriggerCard from '@/components/canteen/NfcTriggerCard';

type Props = {
  render?: (args: { onPress: () => void; isScanning: boolean }) => ReactNode;
};

export default function NfcButton({ render }: Props) {
  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) NfcManager.start();
    });
  }, []);

  const onPress = async () => {
    const isNfcAvailable =
      (await NfcManager.isSupported()) && (await NfcManager.isEnabled());

    if (!isNfcAvailable) {
      Alert.alert(
        'Guthaben-Info',
        'NFC scheint von deinem Gerät nicht unterstützt zu werden.'
      );
      return;
    }

    router.push('/canteen/nfc-sheet');
  };

  if (render) return <>{render({ onPress, isScanning: false })}</>;

  return <NfcTriggerCard onPress={onPress} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- NfcButton.android`
Expected: PASS — both tests green.

- [ ] **Step 5: Typecheck, lint, format**

Run: `npx tsc --noEmit && npm run lint && npm run format`
Expected: no errors.

- [ ] **Step 6: Manual verification on Android**

On a physical Android device with NFC:
1. Tap the "CampusCard-Guthaben prüfen" card → native form sheet slides up with spinner + "Halte deine CampusCard an das Gerät…".
2. Tap a CampusCard → balance + last transaction shown with a "Fertig" button.
3. "Fertig" closes the sheet; tapping the card again works (session re-acquired).
4. Open the sheet and wait without a card → after 5 s shows "Zeitüberschreitung – keine CampusCard erkannt.".
5. Open the sheet and swipe it down mid-scan → it dismisses and a subsequent scan still works (cleanup cancelled the pending request).
6. Disable NFC in system settings → tapping the card shows the Alert and does NOT open the sheet.

- [ ] **Step 7: Commit**

```bash
git add components/canteen/NfcButton.android.tsx __tests__/components/canteen/NfcButton.android.test.tsx
git commit -m "Navigate Android NFC button to native form sheet"
```

---

## Self-Review

**Spec coverage:**
- Android-only native form sheet → Task 1 (route + presentation options). ✓
- iOS untouched → no iOS files in any task; Global Constraints forbid it. ✓
- Thin trigger with availability pre-check + Alert + navigate → Task 2. ✓
- Sheet owns scan state machine (scanning/result/error/timeout) → Task 1 Step 1. ✓
- Scanning UI: spinner + hint, dismissal via swipe → Task 1 Step 1 (no cancel button). ✓
- Result + "Fertig" button via `router.back()` → Task 1 Step 1. ✓
- Cleanup on unmount (clearTimeout + cancelTechnologyRequest) → Task 1 Step 1 effect return. ✓
- No new dependency → uses expo-router form sheet only. ✓
- Cross-platform route reached only from Android → Task 2 navigates; iOS file unchanged. ✓
- Testing: manual Android matrix (Task 2 Step 6) + iOS regression (covered by not touching iOS) + optional trigger unit test (Task 2 Steps 1–4). ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete. ✓

**Type consistency:** `convertBytesToDouble` returns `{ balance, lastTransaction }` (matches existing usage in `NfcButton.android.tsx`). `render` prop signature `{ onPress, isScanning }` preserved across Task 2 producer block and code. Route href `/canteen/nfc-sheet` consistent between Task 1 (file path `app/(tabs)/canteen/nfc-sheet.tsx`) and Task 2 (`router.push`). ✓
