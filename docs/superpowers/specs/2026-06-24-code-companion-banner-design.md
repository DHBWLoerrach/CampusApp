# Code-Companion-Banner — Redesign

Date: 2026-06-24
Status: Approved (design), pending implementation plan

## Context

The Code Companion promo on the schedule screen currently works in two stages:

1. **First visit** to the schedule with an eligible course (prefixes `TIF`, `WDS`,
   `WWI`): the large promo `BottomSheet` **auto-opens**. The user can only close it
   (X); "hide forever" is gated behind `seenCount >= 2`
   (`CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD`).
2. **Afterwards**: a persistent blue pill banner (`reopenBanner` in
   `app/(tabs)/schedule/(sections)/_layout.tsx`) reopens the sheet on tap and
   increments `seenCount`.

Two problems motivated this redesign:

- The auto-popup interrupts the schedule on first visit.
- The banner can only be removed via the detour Sheet → "hide forever", and the
  hide-forever option itself is gated until the user has opened the sheet twice.
- Visually, the banner reads as a passive chat bubble: light-blue pill, blue text,
  no icon, no chevron, no tap affordance — despite being a `TouchableOpacity`. Its
  blue accent also clashes with the app's red identity (`dhbwRed`) and the promo
  sheet, which already uses red for its store buttons.

## Goals

- Make the banner read clearly as a tappable app entry point.
- Remove the intrusive auto-popup; the banner is the entry point from the start.
- Simplify the eligibility/frequency logic, removing now-unnecessary state.
- Keep visual identity coherent with the rest of the app (card language, neutral
  accent, app icon as the only color).

## Non-Goals

- Redesigning the large promo `BottomSheet` visual layout. Only its action buttons
  change: it now always shows both "Nicht mehr automatisch anzeigen" and
  "Schließen" (see below), and the `canHideForever` prop is removed.
- Changing course eligibility (`TIF`/`WDS`/`WWI` prefixes stay).
- Adding a per-banner dismiss (X) control. Removal stays via the sheet only.

## Behavior / first-run logic

- **No auto-popup.** On first schedule open with an eligible course, the **banner**
  is shown directly. The sheet opens only when the user taps the banner.
- **Banner visible** whenever: course is eligible **and** the promo is not dismissed
  forever. No `seenCount` condition.
- **Removal** stays via the sheet → "hide forever", but is **always available** (no
  more `seenCount >= 2` gate). The sheet now always renders both "Nicht mehr
  automatisch anzeigen" (permanent dismiss) and "Schließen" (close once) stacked,
  instead of switching between them. The `canHideForever` prop on
  `CodeCompanionPromoSheetContent` is removed.
- **Remove `seenCount` entirely.** It is no longer used by any path:
  - `constants/StorageKeys.ts`: drop the `codeCompanionPromoSeenCount` key.
  - `lib/codeCompanionPromo.ts`: remove `getCodeCompanionPromoSeenCount`,
    `incrementCodeCompanionPromoSeenCount`, `parseCodeCompanionPromoSeenCount`,
    `CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD`, and the
    `CODE_COMPANION_PROMO_SEEN_COUNT_KEY` import.
  - `_layout.tsx`: remove `promoSeenCount` state, the seen-count load/increment, the
    auto-open effect branch, and the threshold-based `canHidePromoForever`.
  - The only persisted promo state that remains is the `dismissed` flag.

## Visual design — card style

```
┌──────────────────────────────────────────┐
│  ┌────┐  DHBW Code Companion          ›   │
│  │ CC │  Quizfragen · Lernpfade · Level   │
│  └────┘                                   │
└──────────────────────────────────────────┘
```

- White card matching the appointment cards below it: `borderRadius: 8`,
  `borderCurve: 'continuous'`, `borderWidth: 1`, `padding: 12`, background from the
  `background` theme color and border from the `border` theme color (flat, no
  shadow — same as `LectureCard`).
- App icon (`assets/images/codecompanion.png`) on the left inside a framed
  container, reusing the style already used in `CodeCompanionPromoSheetTitle`
  (background + border, rounded).
- **Neutral accent**: dark title, grey subtitle, grey chevron. The icon is the only
  color. No blue, no red.
- Dark mode uses the existing theme colors (`background`, `border`, `text`, `icon`)
  instead of the previous hardcoded blue values (`#EAF3FF`/`#2A5D9F` /
  `#203146`/`#CFE2FF`).
- Spacing: a little more breathing room to the first date header than today's tight
  `marginBottom: 4`.

## Copy

- **Title:** "DHBW Code Companion"
- **Subtitle:** "Quizfragen · Lernpfade · Lernfortschritt" (one word per feature,
  derived from `CODE_COMPANION_FEATURES`). Wording is adjustable.
- Accessibility role/label/hint stay (button role; "opens the Code Companion hint").

## Structure / code changes

- **New component** `components/schedule/CodeCompanionPromoBanner.tsx`: renders icon
  + title + subtitle + chevron and takes an `onPress` (and accessibility props).
  Keeps the large `_layout.tsx` lean and makes the banner independently testable.
- `app/(tabs)/schedule/(sections)/_layout.tsx`:
  - Remove the auto-popup effect branch.
  - Simplify `showPromoReopen` to `!promoOpen && promoDismissed === false &&
    isEligibleCourse`.
  - Replace the inline blue pill JSX with `<CodeCompanionPromoBanner />`.
  - Remove the blue `reopenBackground` / `reopenTextColor` theme hooks and the
    `reopenBanner` / `reopenBannerText` styles.
  - Remove the `canHidePromoForever` variable and stop passing `canHideForever` to
    the sheet.
- `components/schedule/CodeCompanionPromoSheetContent.tsx`: drop the `canHideForever`
  prop; always render both "Nicht mehr automatisch anzeigen" and "Schließen".

## Testing

- `__tests__/lib/codeCompanionPromo.test.ts`: remove `seenCount` and threshold
  tests.
- `__tests__/components/schedule/ScheduleLayout.test.tsx`: update — no auto-popup,
  banner visible from the first eligible visit, hide-forever available on the first
  sheet open, no increment calls.
- Add a small smoke test for `CodeCompanionPromoBanner` (renders title/subtitle,
  fires `onPress`).

## Verification

- `npm run format`, `npx tsc --noEmit`, `npm run lint`, `npm run test` all pass.
- Manual check on iOS/Android, light and dark mode: banner appears on first eligible
  visit without a popup; tapping opens the sheet; "hide forever" removes the banner.
