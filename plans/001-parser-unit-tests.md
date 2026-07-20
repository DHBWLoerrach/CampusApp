# Plan 001: Unit tests for the RSS and canteen XML parsers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cad1cc2..HEAD -- lib/rssParser.ts lib/canteenService.ts __tests__/lib/canteenService.test.ts`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `cad1cc2`, 2026-07-20

## Why this matters

Two of the app's four main tabs — News (RSS) and Mensa (canteen menu) — depend
entirely on hand-written parsers that turn untyped third-party XML into typed UI
data. `lib/icalService.ts` (the schedule parser) has thorough unit tests; the
RSS and canteen parsers have almost none. `lib/rssParser.ts` has **zero** direct
unit tests, and `__tests__/lib/canteenService.test.ts` covers only
`summarizeAllergensAndLabels`, leaving the actual XML-to-data functions
`normalizeCanteenData` and `mealsForDate` untested. These parsers handle
optional fields, alternate date formats, CDATA, and arrays-vs-single-object
quirks of `fast-xml-parser` — exactly the fiddly logic that silently breaks when
the upstream feed shape shifts. This plan adds characterization tests so future
changes to those parsers have a safety net. The repo's own
`docs/unit-tests-plan.md` (Phase 3.1 and 3.2) already identifies this exact gap.

## Current state

Relevant files:

- `lib/rssParser.ts` — parses the DHBW RSS feeds. The core function
  `parseRSSFeed(xmlString, feedUrl?)` is **not exported** today (only
  `fetchAndParseRSSFeed` is). It must be exported to be unit-testable.
- `lib/canteenService.ts` — parses the SWFR canteen XML. `normalizeCanteenData`
  and `mealsForDate` are **already exported**.
- `__tests__/lib/canteenService.test.ts` — existing test file, currently covers
  only `summarizeAllergensAndLabels`. Extend it.
- `__tests__/lib/icalService.test.ts` — **the structural exemplar to copy**:
  inline multi-line-string fixtures joined with `\n`, `@/lib/...` import paths,
  `describe`/`it` blocks, `jest.spyOn(global, 'fetch')` for network mocking.

Key excerpt — `lib/rssParser.ts:99-124` (the function to export and test):

```ts
function parseRSSFeed(xmlString: string, feedUrl?: string): RSSFeed {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlString);

  // Navigate to RSS items
  const rssItems = result?.rss?.channel?.item || [];
  const itemsArray = Array.isArray(rssItems) ? rssItems : [rssItems];

  const items: RSSItem[] = itemsArray
    .filter((item: any) => item && extractText(item.title) && extractId(item))
    .map((item: any) => ({
      id: extractId(item),
      title: extractText(item.title),
      published: item.pubDate || '',
      content: extractContent(item),
      description: extractDescription(item),
      enclosures: extractEnclosures(item),
      link: item.link || '',
    }));

  return { items };
}
```

Notes on `rssParser` behavior the tests must characterize:
- `parserOptions` uses `attributeNamePrefix: '@_'` and `parseAttributeValue: true`.
- `extractId` prefers `item.guid['#text']`, then `item.guid`, then `item.link`.
- An item is dropped by `.filter` unless it has **both** a non-empty title and a
  non-empty id (guid or link).
- `extractEnclosures` reads `enclosure['@_url']` (attribute) among other keys and
  returns `undefined` when there are no enclosures.
- `content` comes from `content:encoded`; `description` from `description`.
  CDATA is handled via the `#cdata` node (`cdataPropName: '#cdata'`).

Key excerpt — `lib/canteenService.ts:39-90` (canteen functions to test):

```ts
export function normalizeCanteenData(raw: string | any): CanteenDay[] {
  try {
    let data: any = raw;
    if (typeof raw === 'string') {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        trimValues: true,
      });
      data = parser.parse(raw);
    }
    // Expected structure: plan -> ort -> tagesplan[] -> menue[]
    const ortList = toArray<any>(data?.plan?.ort);
    const ortNode =
      ortList.find((o) => String(o?.id) === String(SWFR_LOCATION)) ||
      ortList[0];
    const tagesplaene = toArray<any>(ortNode?.tagesplan);
    // ...builds { date, meals } per tagesplan...
  } catch (e) {
    return [];
  }
}

export function mealsForDate(days: CanteenDay[], date: Date): CanteenMeal[] {
  const key = format(date, 'yyyy-MM-dd');
  const exact = days.find((d) => d.date && normalizeDateString(d.date) === key);
  if (exact) return exact.meals;
  const alt1 = format(date, 'dd.MM.yyyy');
  const alt2 = format(date, 'dd.MM.yy');
  const best = days.find(
    (d) =>
      [d.date, normalizeDateString(d.date)].includes(alt1) || d.date === alt2
  );
  return best?.meals ?? [];
}
```

Notes on `canteenService` behavior the tests must characterize:
- `SWFR_LOCATION` is `677`. The parser matches the `<ort>` whose `id` attribute
  is `677`, falling back to the first `ort` if none matches.
- The XMLParser config uses `attributeNamePrefix: ''`, so the `id` attribute
  becomes a plain `id` property on the parsed object.
- A `<menue>` produces a meal only if it yields a non-empty `title` (from
  `nameMitUmbruch` or `name`). `<br>` in titles becomes ` · `.
- Prices are read from `preis.studierende` → label `Studierende`,
  `preis.angestellte` → `Angestellte`, `preis.gaeste` → `Gäste`,
  `preis.schueler` → `Schüler`.
- `normalizeCanteenData` **never throws** — on malformed/empty input it returns
  `[]` (the `try/catch` swallows errors by design; do not change that).
- `normalizeDateString` accepts `yyyy-MM-dd` and `dd.MM.yyyy`/`dd.MM.yy`.

Repo test conventions (follow exactly):
- Tests live under `__tests__/` mirroring source dirs; lib tests in
  `__tests__/lib/`. Name new files `*.test.ts`.
- Import from source via the `@/` alias: `import { x } from '@/lib/rssParser'`.
- Build XML fixtures as inline arrays joined with `\n`, exactly like
  `__tests__/lib/icalService.test.ts:100-111`. Do **not** create separate
  fixture files under a `fixtures/` directory — that structure appears in
  `docs/unit-tests-plan.md` but the actual repo uses inline strings.
- Jest preset is `jest-expo` (see `package.json`); no extra setup needed.

## Commands you will need

| Purpose        | Command                                   | Expected on success |
|----------------|-------------------------------------------|---------------------|
| Typecheck      | `npx tsc --noEmit`                        | exit 0, no errors   |
| Run new tests  | `npx jest __tests__/lib/rssParser.test.ts __tests__/lib/canteenService.test.ts` | all pass |
| Full test run  | `npx jest`                                | all suites pass     |
| Lint           | `npm run lint`                            | exit 0              |
| Format         | `npm run format`                          | writes, exit 0      |

## Scope

**In scope** (the only files you should modify or create):
- `lib/rssParser.ts` — add the word `export` to the `parseRSSFeed` declaration. No other change.
- `__tests__/lib/rssParser.test.ts` — **create**.
- `__tests__/lib/canteenService.test.ts` — **extend** (keep the existing `summarizeAllergensAndLabels` describe block untouched; add new describe blocks).

**Out of scope** (do NOT touch, even though they look related):
- Any parsing logic in `lib/rssParser.ts` or `lib/canteenService.ts` beyond
  adding `export`. This plan characterizes current behavior; it does not fix it.
  If a test reveals a genuine bug, record it in STOP conditions rather than
  "fixing" the parser.
- `lib/icalService.ts` and its tests — already covered.
- `docs/unit-tests-plan.md` — do not edit the doc.

## Git workflow

- Branch: `advisor/001-parser-unit-tests` (repo uses `feature/…`, `fix/…`,
  `chore/…`; for advisor plans use the `advisor/NNN-slug` form).
- Commit style: imperative subject, e.g. `Add unit tests for RSS and canteen parsers`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Export `parseRSSFeed`

In `lib/rssParser.ts`, change the declaration on line 102 from
`function parseRSSFeed(` to `export function parseRSSFeed(`. Change nothing else.

**Verify**: `npx tsc --noEmit` → exit 0. Then
`grep -n "export function parseRSSFeed" lib/rssParser.ts` → one match.

### Step 2: Write `__tests__/lib/rssParser.test.ts`

Create the file. Import `parseRSSFeed` and the `RSSItem`/`RSSFeed` types from
`@/lib/rssParser`. Build RSS XML fixtures inline (array + `.join('\n')`). Cover
these cases, one `it` per case:

1. **Standard feed, single item** — a `<rss><channel><item>` with `<title>`,
   `<guid>`, `<link>`, `<pubDate>`, `<description>`. Assert `items` has length 1
   and the fields map correctly (`id` from guid, `title`, `published` from
   pubDate, `link`).
2. **CDATA content** — an item whose `<content:encoded>` is wrapped in
   `<![CDATA[ ... ]]>`. Assert `content` equals the inner text (trimmed).
3. **Enclosure (thumbnail)** — an item with
   `<enclosure url="https://example.org/img.jpg" />`. Assert
   `enclosures?.[0]?.url` equals that URL.
4. **Missing optional fields** — an item with only `<title>` and `<guid>` (no
   description, content, enclosure, link). Assert it still parses (length 1) and
   that `enclosures` is `undefined` and `content`/`description` are `''`.
5. **Item dropped when title or id missing** — a channel with two items, one
   valid and one lacking a title (or lacking both guid and link). Assert `items`
   has length 1 (the invalid one is filtered out).
6. **Multiple items parse as an array** — a channel with two valid items. Assert
   `items` has length 2 (this exercises the `Array.isArray` branch).

Structural pattern to follow: `__tests__/lib/icalService.test.ts` (inline
string fixtures, `describe`/`it`, direct assertions).

**Verify**: `npx jest __tests__/lib/rssParser.test.ts` → all pass, 6 tests.

### Step 3: Extend `__tests__/lib/canteenService.test.ts`

Keep the existing `describe('summarizeAllergensAndLabels', ...)` block. Add
imports for `normalizeCanteenData`, `mealsForDate`, and the `CanteenDay` type
from `@/lib/canteenService`. Add two new `describe` blocks:

**`describe('normalizeCanteenData', ...)`** — build SWFR XML inline. The
expected structure is `plan → ort (id="677") → tagesplan (datum=...) → menue`.
Example fixture shape (adapt as needed):

```ts
const xml = [
  '<plan>',
  '  <ort id="677">',
  '    <tagesplan datum="2025-06-23">',
  '      <menue>',
  '        <name>Spaghetti Bolognese</name>',
  '        <art>Hauptgericht</art>',
  '        <preis>',
  '          <studierende>3,50</studierende>',
  '          <angestellte>5,00</angestellte>',
  '        </preis>',
  '      </menue>',
  '    </tagesplan>',
  '  </ort>',
  '</plan>',
].join('\n');
```

Cases:
1. **Valid XML** → returns one day with `date` `'2025-06-23'` and one meal whose
   `title` is `'Spaghetti Bolognese'` and whose `prices` contains
   `{ Studierende: '3,50', Angestellte: '5,00' }`.
2. **Empty string input** (`normalizeCanteenData('')`) → returns `[]`.
3. **Structurally-missing input** — valid XML with no `<plan>`/`<ort>` (e.g.
   `'<other></other>'`) → returns `[]`.
4. **Menue with no name** — a `<menue>` lacking `name`/`nameMitUmbruch` produces
   no meal (that day's `meals` is empty).

**`describe('mealsForDate', ...)`** — construct `CanteenDay[]` objects directly
(no XML needed) and pass a `Date`:
1. **Exact ISO match** — `days = [{ date: '2025-06-23', meals: [meal] }]`,
   `mealsForDate(days, new Date(2025, 5, 23))` → returns `[meal]`.
2. **German date-format fallback** — `days = [{ date: '23.06.2025', meals: [meal] }]`,
   same date → returns `[meal]`.
3. **No match** → returns `[]`.

**Verify**: `npx jest __tests__/lib/canteenService.test.ts` → all pass
(6 existing + your new tests).

### Step 4: Full verification and formatting

**Verify**:
- `npx tsc --noEmit` → exit 0.
- `npx jest` → all suites pass (was 17 suites / 78 tests before; now 18 suites
  and more tests).
- `npm run lint` → exit 0.
- `npm run format` → exit 0 (formats your new files).

## Test plan

- New file `__tests__/lib/rssParser.test.ts`: 6 tests (standard, CDATA,
  enclosure, missing-optionals, dropped-invalid, multi-item array).
- Extended `__tests__/lib/canteenService.test.ts`: `normalizeCanteenData`
  (4 cases) + `mealsForDate` (3 cases), existing block unchanged.
- Structural pattern: `__tests__/lib/icalService.test.ts`.
- Verification: `npx jest` → all pass, including the new tests.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `grep -n "export function parseRSSFeed" lib/rssParser.ts` returns exactly one match
- [ ] `npx jest __tests__/lib/rssParser.test.ts` passes with 6 tests
- [ ] `npx jest __tests__/lib/canteenService.test.ts` passes (existing 6 + new)
- [ ] `npx jest` — all suites pass
- [ ] `npm run lint` exits 0
- [ ] `git status` shows only `lib/rssParser.ts`, `__tests__/lib/rssParser.test.ts`, `__tests__/lib/canteenService.test.ts` modified/created
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `lib/rssParser.ts:102` or `lib/canteenService.ts:39-90` doesn't
  match the excerpts above (the codebase has drifted).
- A test you write asserts current behavior and **fails** in a way that reveals
  a real parser bug (e.g. `normalizeCanteenData` throws instead of returning
  `[]`). Report the discrepancy; do not modify the parser to make it pass.
- `fast-xml-parser` produces a shape different from what a case assumes and you
  cannot characterize it after one reasonable adjustment. Report the actual
  parsed shape.
- Making a test pass appears to require touching an out-of-scope file.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- These are **characterization tests** — they lock in current behavior, not a
  spec. If the SWFR or DHBW feed format changes, update the fixtures alongside
  the parser.
- Reviewer should scrutinize: that no parser logic changed (only `export` was
  added), and that fixtures reflect realistic feed shapes (compare against a
  live response if available).
- Deferred out of this plan: `icalService` internal helpers
  (`normalizeTimezones`, `structureEventsByDay`) and hook-level tests remain as
  `docs/unit-tests-plan.md` describes; not part of this plan.
</content>
</invoke>
