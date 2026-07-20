# Plan 002: Add `.env.example` and document required environment variables

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cad1cc2..HEAD -- README.md constants/FeatureFlags.ts lib/ridesService.ts lib/canteenService.ts`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `cad1cc2`, 2026-07-20

## Why this matters

Onboarding a new developer currently requires tribal knowledge. `README.md`
step 4 says only "request the required API keys (e.g. for the SWFR canteen) and
put them in a `.env` file" — but it never lists **which** variables exist. The
code reads four `EXPO_PUBLIC_*` variables spread across three files, and the
committed `.env` (gitignored, correctly) contains only one of them. A newcomer
cannot tell that the rides feature has its own flags, or that the canteen key is
the one truly-required secret. A checked-in `.env.example` plus a short README
table is the standard fix: it documents the contract without leaking any secret
value (the example file contains placeholders only).

## Current state

The four environment variables actually referenced in code (confirmed via
`grep -rhoE "EXPO_PUBLIC_[A-Z_]+" app components lib hooks context constants`):

| Variable                   | Read in                                   | Required? | Meaning / default |
|----------------------------|-------------------------------------------|-----------|-------------------|
| `EXPO_PUBLIC_SWFR_API_KEY` | `lib/canteenService.ts:5`                 | **Yes**   | SWFR canteen API key. Without it, `fetchCanteenRaw` throws. This is the one key to request from the project lead. |
| `EXPO_PUBLIC_RIDES_ENABLED`| `constants/FeatureFlags.ts:19`            | No        | Feature flag for the rides/carpool UI. Default **`false`** (feature hidden). Accepts `true/false/1/0/on/off/yes/no`. |
| `EXPO_PUBLIC_RIDES_SOURCE` | `lib/ridesService.ts:30`                  | No        | `file` or `remote`. Default **`remote`**. Dev-only: `file` loads a local JSON. |
| `EXPO_PUBLIC_RIDES_URL`    | `lib/ridesService.ts:20`                  | No        | Override for the rides index URL. Default is the hard-coded `https://data.apps.szi.dhbw-loerrach.de/courses-rides.json`. |

Excerpt — `lib/canteenService.ts:5-9`:

```ts
const API_KEY = process.env.EXPO_PUBLIC_SWFR_API_KEY as string;
// 677 = Lörrach, for tests use 610 = Mensa Rempartstraße Freiburg
const SWFR_LOCATION = 677;
```

Excerpt — `constants/FeatureFlags.ts:17-22`:

```ts
export const RIDES_FEATURE_ENABLED: boolean = parseBoolEnv(
  process.env.EXPO_PUBLIC_RIDES_ENABLED as string | undefined,
  false
);
```

Excerpt — `lib/ridesService.ts:19-33`:

```ts
export const DEFAULT_RIDES_URL: string =
  (process.env.EXPO_PUBLIC_RIDES_URL as string) ||
  'https://data.apps.szi.dhbw-loerrach.de/courses-rides.json';
// ...
export function getRidesSource(): RidesSource {
  const src = String(process.env.EXPO_PUBLIC_RIDES_SOURCE || '')
    .trim()
    .toLowerCase();
  return src === 'file' ? 'file' : 'remote';
}
```

Facts about the repo you must respect:
- `.env` is gitignored (`.gitignore` lists `.env` and `.env*.local`).
  `.env.example` is **not** ignored — verified with
  `git check-ignore .env.example` (exit 1 = not ignored). So the example file
  will be committed, which is the intent.
- `EXPO_PUBLIC_*` variables are inlined into the client bundle at build time by
  Expo — they are **not secrets in the cryptographic sense** (they ship in the
  app). The `.env.example` therefore documents the contract; the real key value
  still lives only in the gitignored `.env`.
- The `.env` file currently holds only `EXPO_PUBLIC_SWFR_API_KEY`.

**Never put a real key value in `.env.example`.** Use an obvious placeholder.

## Commands you will need

| Purpose               | Command                              | Expected on success |
|-----------------------|--------------------------------------|---------------------|
| Confirm not ignored   | `git check-ignore .env.example`      | exit 1 (no output)  |
| Typecheck (unaffected)| `npx tsc --noEmit`                   | exit 0              |
| Lint                  | `npm run lint`                       | exit 0              |
| Format                | `npm run format`                     | exit 0              |

## Scope

**In scope** (the only files you should create or modify):
- `.env.example` — **create**.
- `README.md` — add one short subsection documenting the variables.

**Out of scope** (do NOT touch):
- `.env` — never read, print, edit, or copy its real values.
- `.gitignore` — no change needed; `.env.example` is already un-ignored.
- Any source file. This is documentation only; no code behavior changes.
- The rides feature code itself (that is a separate direction discussion).

## Git workflow

- Branch: `advisor/002-env-example-and-docs`.
- Commit style: imperative subject, e.g. `Add .env.example and document env vars`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `.env.example`

Create `.env.example` in the repo root with placeholder values and a short
comment per variable. Use this exact content:

```dotenv
# Copy this file to `.env` and fill in the real values.
# All EXPO_PUBLIC_* vars are inlined into the app bundle at build time.

# --- Required ---
# SWFR canteen API key (request from the project lead). Without it the
# canteen (Mensa) tab cannot load data.
EXPO_PUBLIC_SWFR_API_KEY=your-swfr-api-key-here

# --- Optional (safe defaults exist; leave unset for normal development) ---

# Show the rides/carpool UI in the schedule header. Default: false.
# Accepts: true/false, 1/0, on/off, yes/no.
EXPO_PUBLIC_RIDES_ENABLED=false

# Source for the rides index JSON: "remote" (default) or "file" (dev-only,
# loads scripts/courses-rides.json locally).
EXPO_PUBLIC_RIDES_SOURCE=remote

# Override the rides index URL. Default (when unset):
# https://data.apps.szi.dhbw-loerrach.de/courses-rides.json
# EXPO_PUBLIC_RIDES_URL=
```

**Verify**: `git check-ignore .env.example` → exit 1 (file is NOT ignored, so it
will be committed). `test -f .env.example && echo ok` → `ok`.

### Step 2: Document the variables in `README.md`

`README.md` step 4 (around lines 31–32) currently reads (German):

```
4. Benötigte API-Keys (z.B. für die Mensa des SWFR) vom Projektverantwortlichen anfordern und in eine Datei `.env` eintragen
```

Add a new subsection immediately **after** the numbered setup list ends and
**before** the `## Abhängigkeiten ändern (add/update/remove)` heading (around
line 52). Match the existing German prose and Markdown style. Insert:

```markdown
### Umgebungsvariablen (`.env`)

Kopiere `.env.example` nach `.env` und trage die Werte ein. Alle
`EXPO_PUBLIC_*`-Variablen werden beim Build in die App eingebettet.

| Variable                    | Erforderlich | Bedeutung                                                                 |
| --------------------------- | ------------ | ------------------------------------------------------------------------- |
| `EXPO_PUBLIC_SWFR_API_KEY`  | Ja           | API-Key für den Mensa-Speiseplan (SWFR). Beim Projektverantwortlichen anfordern. |
| `EXPO_PUBLIC_RIDES_ENABLED` | Nein         | Zeigt die Mitfahr-Funktion im Stundenplan. Standard: `false`.             |
| `EXPO_PUBLIC_RIDES_SOURCE`  | Nein         | Quelle der Mitfahr-Daten: `remote` (Standard) oder `file` (nur Dev).      |
| `EXPO_PUBLIC_RIDES_URL`     | Nein         | Überschreibt die URL der Mitfahr-Daten. Standardwert ist fest hinterlegt. |
```

Optionally update the wording of step 4 to reference `.env.example`, but keep it
minimal — the table is the substantive addition.

**Verify**: `grep -c "EXPO_PUBLIC_" README.md` → 4 or more.

### Step 3: Verify nothing else broke

**Verify**:
- `npx tsc --noEmit` → exit 0 (unaffected).
- `npm run lint` → exit 0.
- `npm run format` → exit 0 (`.env.example` is not matched by the format glob
  `**/*.{js,ts,tsx,css,json}`, so it is left as-is; that is fine).

## Test plan

No unit tests — this plan adds documentation and a config template only.
Verification is the commands above plus manual confirmation that `.env.example`
contains **placeholders, not real values**.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `.env.example` exists at repo root and is committed (`git check-ignore .env.example` → exit 1)
- [ ] `.env.example` documents all four variables: `grep -c "EXPO_PUBLIC_" .env.example` → 4
- [ ] `.env.example` contains no real secret (the SWFR key value is a placeholder like `your-swfr-api-key-here`)
- [ ] `README.md` documents the variables: `grep -c "EXPO_PUBLIC_" README.md` → 4 or more
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run lint` exits 0
- [ ] `git status` shows only `.env.example` (new) and `README.md` (modified)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The set of `EXPO_PUBLIC_*` variables in the code differs from the four listed
  here — re-run `grep -rhoE "EXPO_PUBLIC_[A-Z_]+" app components lib hooks context constants --include='*.ts' --include='*.tsx' | sort -u`
  and report the actual list before writing the file.
- `git check-ignore .env.example` returns exit 0 (meaning it WOULD be ignored) —
  do not force-add; report the `.gitignore` state instead.
- You are tempted to read or copy the real `.env` contents — do not; use the
  placeholder from Step 1.

## Maintenance notes

For the human/agent who owns this after the change lands:

- When a new `EXPO_PUBLIC_*` variable is added to the code, add it to both
  `.env.example` and the README table in the same PR.
- Reviewer should scrutinize: that `.env.example` contains no real key value.
- The rides variables exist because the rides feature is currently behind a
  flag (default off). If that feature is ever removed, drop its three variables
  from both files.
</content>
