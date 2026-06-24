# Android NFC Form Sheet — Design

**Date:** 2026-06-24
**Status:** Approved, ready for implementation plan

## Goal

On Android, present the CampusCard NFC scanning hint and the scan result in a
**native form sheet** (`presentation: "formSheet"` via Expo Router /
react-native-screens) instead of the current centered, JS-animated `Modal` in
`components/canteen/NfcButton.android.tsx`.

## Scope

- **Android only.** iOS is untouched and keeps using the native CoreNFC system
  sheet (`components/canteen/NfcButton.ios.tsx`).
- No new dependencies. The native sheet comes from the already-installed
  `expo-router` (~56) + `react-native-screens` (4.25.2) on Expo SDK 56.
- The existing custom `components/ui/BottomSheet.tsx` is intentionally **not**
  used here — it is a JS `Modal` + `Animated` component, not a native sheet.

## Components & Changes

### 1. New route: `app/(tabs)/canteen/nfc-sheet.tsx`

A form-sheet screen that owns the entire Android NFC scan state machine.

Registered in the canteen stack (`app/(tabs)/canteen/_layout.tsx`) as an
additional `Stack.Screen`:

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

- The screen content is wrapped in a `flex: 1` `View` with a themed background
  (`useThemeColor`), per the react-native-screens form-sheet guidance — set
  `contentStyle` transparent and provide the background on the content view.
- The detent `[0.3]` is a starting value; tune to fit the content (spinner + two
  lines while scanning; result text + button on success) during implementation.

**Cross-platform note (deliberate decision):** The route file is shared across
platforms, but is only ever navigated to from `NfcButton.android.tsx`. iOS never
pushes this route, so the Android-specific NFC calls inside it never execute on
iOS. We keep a single shared route rather than a platform-specific route file to
avoid a missing-route registration warning on iOS.

### 2. `components/canteen/NfcButton.android.tsx` becomes a thin trigger

- Keeps the init effect: `NfcManager.isSupported().then(s => s && NfcManager.start())`.
- Renders **only** the trigger (`render(...)` prop or `NfcTriggerCard`).
- `onPress`:
  - `const available = (await NfcManager.isSupported()) && (await NfcManager.isEnabled())`
  - If not available → `Alert.alert('Guthaben-Info', 'NFC scheint von deinem Gerät nicht unterstützt zu werden.')` and return (no navigation).
  - Otherwise → `router.push('/canteen/nfc-sheet')`.
- The old centered `<Modal>`, plus the `isScanning` and `modalMessage` state and
  related styles, are **removed**. The `isScanning` value previously passed to
  `render(...)` is no longer produced here; if a consumer relies on it, it stays
  `false` (the trigger no longer reflects in-progress scans — the sheet does).

### 3. NFC state machine lives in the sheet screen

State: `scanning` → `result` | `error` (covers timeout).

On mount, run the scan (logic moved from the current Android `onPress`):

1. `await NfcManager.cancelTechnologyRequest().catch(() => {})`
2. Start a 5000 ms timeout that flags `timedOut` and calls
   `cancelTechnologyRequest()`.
3. `await NfcManager.requestTechnology(NfcTech.IsoDep)`; if `timedOut` throw.
4. `transceive([0x5a, 0x5f, 0x84, 0x15])`, then `transceive([0x6c, 0x1])`
   (balance), then `transceive([0xf5, 0x1])` (last transaction).
5. `convertBytesToDouble(balanceBytes, lastTransactionBytes)` from
   `@/lib/nfcHelper`.

UI per state:

- **scanning:** `ActivityIndicator` + "Halte deine CampusCard an das Gerät…".
  No cancel button — dismissal is via the native swipe/grabber.
- **result:** "Guthaben: {balance}€ / Letzte Transaktion: {lastTransaction}€ /
  (Angaben ohne Gewähr)" + a "Fertig" button calling `router.back()`.
- **error / timeout:** timeout → "Zeitüberschreitung – keine CampusCard
  erkannt."; other errors → "NFC Fehler – bitte erneut versuchen." (and
  `console.warn`). Plus a "Fertig" button calling `router.back()`.

**Cleanup:** a `useEffect` cleanup on unmount (covers swipe-dismiss, hardware
back, and the "Fertig" button) runs `clearTimeout(...)` and
`NfcManager.cancelTechnologyRequest().catch(() => {})`.

## Data Flow

```
NfcTriggerCard (Android)
  -> onPress: availability check
       -> unavailable: Alert, stop
       -> available:   router.push('/canteen/nfc-sheet')
            -> nfc-sheet screen mounts
                 -> scan (requestTechnology + transceive, 5s timeout)
                 -> render scanning | result | error
                 -> dismiss (swipe / "Fertig" / back)
                      -> unmount cleanup: clearTimeout + cancelTechnologyRequest
```

## Error Handling

- NFC unavailable/disabled: handled before navigation via `Alert` (sheet never
  opens).
- Timeout (5 s, no card): dedicated message inside the sheet.
- Transceive / other failures: generic error message + `console.warn`.
- Dismiss mid-scan: cleanup cancels the pending technology request so no session
  leaks.

## Testing

- **Manual on a physical Android device** (NFC required): successful scan, 5 s
  timeout with no card, transceive error, and swipe-to-dismiss mid-scan (verify
  the session is cancelled and a re-scan works).
- **iOS regression check:** confirm `NfcButton.ios.tsx` behavior is unchanged
  (native system sheet, result shown via `setAlertMessageIOS`).
- Optional light unit test: tapping the trigger with NFC available calls
  `router.push('/canteen/nfc-sheet')`; with NFC unavailable it shows the Alert
  and does not navigate (mock `NfcManager` and `expo-router`).

## Out of Scope

- Changing the iOS flow.
- Replacing `components/ui/BottomSheet.tsx` or migrating it to a native sheet.
- Adding `@gorhom/bottom-sheet` or any new dependency.
- Multi-detent / draggable expansion of the NFC sheet.
