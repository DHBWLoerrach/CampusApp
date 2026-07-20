# Plan 003: Deduplicate Android NFC permissions in `app.json`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cad1cc2..HEAD -- app.json`
> If `app.json` changed since this plan was written, compare the "Current
> state" excerpt against the live file before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `cad1cc2`, 2026-07-20

## Why this matters

`app.json` declares the Android NFC permission four times — the same permission
listed twice under two spellings, each spelling repeated:
`["NFC", "android.permission.NFC", "NFC", "android.permission.NFC"]`. Expo
normalizes and dedupes these when it generates `AndroidManifest.xml`, so the
built app is unaffected — but the config is confusing and looks like an
accidental copy-paste. `"NFC"` and `"android.permission.NFC"` resolve to the
identical manifest permission. Collapsing to a single canonical entry removes
the noise and prevents a future reader from thinking multiple distinct
permissions are intended. This is pure config hygiene: low effort, low risk.

## Current state

`android/` and `ios/` are **generated** by Expo (CNG / prebuild) and are
gitignored — the source of truth for permissions is `app.json`. The relevant
block in `app.json`:

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon.png",
    "monochromeImage": "./assets/images/monochrome-icon.png"
  },
  "permissions": [
    "NFC",
    "android.permission.NFC",
    "NFC",
    "android.permission.NFC"
  ],
  "package": "de.dhbwloe.loerrach.campusapp"
},
```

Additional context:
- The `react-native-nfc-manager` config plugin is already listed under
  `plugins` in `app.json` (with an `nfcPermission` string). Config plugins for
  NFC libraries commonly add the NFC permission to the manifest themselves,
  which means the manual `permissions` array may even be redundant. This plan
  takes the **conservative** path: keep one explicit NFC permission entry rather
  than removing the array entirely, so behavior is provably unchanged.
- Expo's `android.permissions` accepts both bare names (`"NFC"`) and
  fully-qualified names (`"android.permission.NFC"`); they map to the same
  manifest entry. The fully-qualified form is the least ambiguous.

## Commands you will need

| Purpose             | Command                                                        | Expected on success |
|---------------------|---------------------------------------------------------------|---------------------|
| Validate JSON       | `node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); console.log('valid')"` | prints `valid` |
| Inspect array       | `node -e "console.log(JSON.stringify(require('./app.json').expo.android.permissions))"` | `["android.permission.NFC"]` |
| Typecheck (unaffected)| `npx tsc --noEmit`                                          | exit 0              |
| Format              | `npm run format`                                              | exit 0              |

## Scope

**In scope** (the only file you should modify):
- `app.json` — the `expo.android.permissions` array only.

**Out of scope** (do NOT touch, even though they look related):
- The `plugins` array, including the `react-native-nfc-manager` entry and its
  `nfcPermission` string — leave it exactly as is.
- `android/` and `ios/` directories — generated and gitignored; do not run
  `expo prebuild` as part of this plan (it mutates the working tree).
- Any iOS NFC configuration.
- Any other key in `app.json`.

## Git workflow

- Branch: `advisor/003-dedupe-android-nfc-permissions`.
- Commit style: imperative subject, e.g. `Dedupe Android NFC permission in app.json`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Collapse the permissions array to a single canonical entry

In `app.json`, replace the four-element `permissions` array under
`expo.android` with a single fully-qualified entry:

```json
"permissions": ["android.permission.NFC"],
```

Change nothing else in the file. Preserve the surrounding `adaptiveIcon` and
`package` keys and the existing indentation (the file uses 2-space indent).

**Verify**:
- `node -e "console.log(JSON.stringify(require('./app.json').expo.android.permissions))"`
  → prints exactly `["android.permission.NFC"]`.
- `node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); console.log('valid')"`
  → prints `valid`.

### Step 2: Verify nothing else changed and formatting holds

**Verify**:
- `git diff app.json` shows only the `permissions` array changed (the
  `adaptiveIcon`, `package`, `plugins`, and all other keys are untouched).
- `npm run format` → exit 0 (`app.json` matches the format glob; confirm it
  does not reformat unexpectedly — if Prettier rewrites the array to one line,
  that is acceptable as long as the single entry is preserved).
- `npx tsc --noEmit` → exit 0 (unaffected, sanity check).

## Test plan

No unit tests apply — this is a static config change. Verification is the
JSON-inspection commands above. If a reviewer has an Android toolchain and wants
belt-and-suspenders confidence, they may run `npx expo prebuild -p android`
locally and confirm `AndroidManifest.xml` still contains exactly one
`<uses-permission android:name="android.permission.NFC" />` — but this is
**optional** and outside the automated gates (it regenerates `android/`).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node -e "console.log(JSON.stringify(require('./app.json').expo.android.permissions))"` prints `["android.permission.NFC"]`
- [ ] `app.json` is valid JSON (the JSON.parse command prints `valid`)
- [ ] `git diff app.json` touches only the `permissions` array
- [ ] `npx tsc --noEmit` exits 0
- [ ] `git status` shows only `app.json` modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The current `permissions` array in `app.json` is not the exact four-element
  array shown in "Current state" (the file has drifted) — report what it
  actually contains.
- `app.json` fails to parse as JSON after your edit.
- You find evidence that `"NFC"` and `"android.permission.NFC"` were intended to
  express two different permissions (they are not — but if documentation in the
  repo claims otherwise, stop and surface it).

## Maintenance notes

For the human/agent who owns this after the change lands:

- If NFC ever stops working on a fresh Android build after this change, the most
  likely cause is that the manual permission entry was actually needed because
  the `react-native-nfc-manager` plugin version in use does not inject it —
  re-check the generated `AndroidManifest.xml` after `expo prebuild`.
- Reviewer should scrutinize: that only the `permissions` array changed and the
  NFC config plugin entry under `plugins` is untouched.
- Deferred: deciding whether the `permissions` array can be dropped entirely
  (relying solely on the config plugin) is left out of scope to keep this change
  provably behavior-neutral.
</content>
