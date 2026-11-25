import ICAL from 'ical.js';
import { resolveCourseAlias } from '@/constants/CourseAliases';

// --- Type Definitions ---

// Defines the structure of a single parsed event.
export interface TimetableEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description?: string;
  // True when the source ICS used a DATE (all-day) rather than DATE-TIME
  allDay?: boolean;
}

// Defines the final data structure for the UI: a key‑value map
// where the key is a date string ('YYYY-MM-DD') and the value is an array of events.
export interface StructuredTimetable {
  [dateKey: string]: TimetableEvent[];
}

export enum CalendarErrorCode {
  InvalidCourse = 'INVALID_COURSE',
  Network = 'NETWORK',
  Http = 'HTTP',
  Parse = 'PARSE',
}

export class CalendarError extends Error {
  constructor(
    public readonly code: CalendarErrorCode,
    options?: {
      cause?: unknown;
      status?: number;
      statusText?: string;
    }
  ) {
    super(code, { cause: options?.cause });
    this.name = 'CalendarError';
    this.status = options?.status;
    this.statusText = options?.statusText;
  }

  readonly status?: number;
  readonly statusText?: string;
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

const CALENDAR_TIMEZONE = 'Europe/Berlin';
const MS_IN_DAY = 24 * 60 * 60 * 1000;

// Defensive limits to prevent client-side DoS from malformed or adversarial ICS feeds.
// Allows safe RFC-5321 mailbox characters (alphanumerics, '-', '_', '+', single '.')
// while rejecting path traversal ('..', '/'), query/fragment ('?', '#'), and '@'.
const VALID_COURSE_REGEX =
  /^[a-z0-9](?:(?:[a-z0-9_+-]|\.(?!\.)){0,62}[a-z0-9_+-])?$/;
const VALIDATE_COURSE_TIMEOUT_MS = 10_000;
const MAX_ICAL_BYTES = 15 * 1024 * 1024; // 15 MiB
const MAX_RECURRENCE_ITERATIONS_PER_EVENT = 5_000;
const MAX_TOTAL_RECURRENCE_ITERATIONS = 20_000;
// Covers the full visible window ([now - 7d, now + 1y] <= 374 days) with margin.
const MAX_EVENT_SPAN_DAYS = 380;
const MAX_PARSED_EVENTS = 10_000;
const MAX_HTML_COMMENT_PASSES = 3;
const PROTECTED_TZIDS = new Set(['Z', 'UTC', 'GMT']);

const BERLIN_YMD_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: CALENDAR_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const BERLIN_OFFSET_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: CALENDAR_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  hourCycle: 'h23',
});

function utcDayKeyFromYmd(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function addDaysToYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function getBerlinOffsetMinutes(date: Date): number {
  const parts = BERLIN_OFFSET_FORMATTER.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  let year = Number(map.year);
  let month = Number(map.month);
  let day = Number(map.day);
  let hour = Number(map.hour);
  const minute = Number(map.minute);
  const second = Number(map.second);

  // Some Intl implementations can emit "24" for midnight.
  if (hour === 24) {
    hour = 0;
    const tmp = new Date(Date.UTC(year, month - 1, day));
    tmp.setUTCDate(tmp.getUTCDate() + 1);
    year = tmp.getUTCFullYear();
    month = tmp.getUTCMonth() + 1;
    day = tmp.getUTCDate();
  }

  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return (asUtc - date.getTime()) / 60000;
}

function berlinMidnight(ymd: string): Date {
  const utcMidnight = utcDayKeyFromYmd(ymd);

  // Iterate to account for potential offset changes around midnight.
  let t = utcMidnight;
  for (let i = 0; i < 3; i += 1) {
    const offsetMinutes = getBerlinOffsetMinutes(new Date(t));
    const candidate = utcMidnight - offsetMinutes * 60 * 1000;
    if (candidate === t) break;
    t = candidate;
  }

  return new Date(t);
}

function ymdFromIcalDate(time: ICAL.Time): string {
  const mm = String(time.month).padStart(2, '0');
  const dd = String(time.day).padStart(2, '0');
  return `${time.year}-${mm}-${dd}`;
}

/**
 * Clips a multi-day range `[firstDay, lastDay]` to at most `MAX_EVENT_SPAN_DAYS`
 * calendar days. When a long-running event (e.g. a multi-year study period)
 * overlaps the visible window, the retained span is anchored on the visible
 * window so current and upcoming days are preserved instead of keeping only the
 * earliest days from DTSTART.
 */
function resolveCappedDayRange(
  firstDay: string,
  lastDay: string,
  windowBounds?: { startKey: string; endKey: string }
): { startDay: string; dayCount: number } {
  const rawDayCount =
    Math.round(
      (utcDayKeyFromYmd(lastDay) - utcDayKeyFromYmd(firstDay)) / MS_IN_DAY
    ) + 1;

  if (!Number.isFinite(rawDayCount) || rawDayCount <= 1) {
    return { startDay: firstDay, dayCount: 1 };
  }

  if (rawDayCount <= MAX_EVENT_SPAN_DAYS) {
    return { startDay: firstDay, dayCount: rawDayCount };
  }

  if (
    windowBounds &&
    firstDay <= windowBounds.endKey &&
    lastDay >= windowBounds.startKey
  ) {
    const clippedStart =
      firstDay > windowBounds.startKey ? firstDay : windowBounds.startKey;
    const clippedEnd =
      lastDay < windowBounds.endKey ? lastDay : windowBounds.endKey;
    const clippedCount =
      Math.round(
        (utcDayKeyFromYmd(clippedEnd) - utcDayKeyFromYmd(clippedStart)) /
          MS_IN_DAY
      ) + 1;
    return {
      startDay: clippedStart,
      dayCount: Number.isFinite(clippedCount)
        ? Math.min(MAX_EVENT_SPAN_DAYS, Math.max(1, clippedCount))
        : 1,
    };
  }

  return { startDay: firstDay, dayCount: MAX_EVENT_SPAN_DAYS };
}

/**
 * Maps an all-day (DATE) range to one slice per Berlin calendar day.
 * DATE values are calendar days, not instants, so they must not pass through
 * the device timezone. The DHBW feed writes DTEND inclusively (single-day
 * events carry DTEND = DTSTART, Easter runs Good Friday to Easter Monday), so
 * an explicit end date counts as the last day of the event.
 */
function allDaySlices(
  start: ICAL.Time,
  end: ICAL.Time,
  hasExplicitEnd: boolean,
  windowBounds?: { startKey: string; endKey: string }
): { start: Date; end: Date }[] {
  const firstDay = ymdFromIcalDate(start);
  // Without DTEND, ical.js derives an exclusive end (RFC 5545: one day)
  const lastDay = hasExplicitEnd
    ? ymdFromIcalDate(end)
    : addDaysToYmd(ymdFromIcalDate(end), -1);
  const { startDay, dayCount } = resolveCappedDayRange(
    firstDay,
    lastDay,
    windowBounds
  );

  const slices: { start: Date; end: Date }[] = [];
  let currentStart = berlinMidnight(startDay);
  for (let offset = 0; offset < dayCount; offset += 1) {
    const nextEnd = berlinMidnight(addDaysToYmd(startDay, offset + 1));
    slices.push({ start: currentStart, end: nextEnd });
    currentStart = nextEnd;
  }
  return slices;
}

/**
 * Resolves course aliases, normalizes to lowercase, and verifies the course code
 * only contains safe mailbox characters (preventing URL path/query/fragment injection).
 */
function normalizeAndValidateCourse(course: string): string | null {
  if (!course) return null;
  const canonical = resolveCourseAlias(course).toLowerCase();
  if (!VALID_COURSE_REGEX.test(canonical)) return null;
  return canonical;
}

/**
 * Generates the iCal URL for an already validated canonical course code.
 */
function generateIcalUrl(canonicalCourse: string): string {
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${encodeURIComponent(canonicalCourse)}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

/**
 * Validates if a course exists by checking if the iCal URL is accessible.
 */
export async function validateCourse(course: string): Promise<boolean> {
  const canonical = normalizeAndValidateCourse(course);
  if (!canonical) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    VALIDATE_COURSE_TIMEOUT_MS
  );

  try {
    const icalUrl = generateIcalUrl(canonical);
    const response = await fetch(icalUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.warn('Course validation failed:', error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Reads a response body as UTF-8 text while enforcing a strict byte limit.
 * When the runtime exposes a ReadableStream body (e.g. Expo's winter fetch),
 * bytes are counted incrementally and the download is aborted as soon as the
 * limit is exceeded. Falls back to measuring UTF-8 bytes after `response.text()`
 * when no stream is available (e.g. minimal test mocks).
 */
async function readResponseTextWithinLimit(
  response: Response,
  maxBytes: number,
  onLimitExceeded: () => void
): Promise<string> {
  const body = response.body;
  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let totalBytes = 0;
    const chunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          onLimitExceeded();
          await reader.cancel().catch(() => {});
          throw new CalendarError(CalendarErrorCode.Parse);
        }

        chunks.push(decoder.decode(value, { stream: true }));
      }

      chunks.push(decoder.decode());
      return chunks.join('');
    } finally {
      reader.releaseLock();
    }
  }

  const text = await response.text();
  if (utf8ByteLength(text) > maxBytes) {
    onLimitExceeded();
    throw new CalendarError(CalendarErrorCode.Parse);
  }
  return text;
}

/**
 * Fetches the raw iCal data from the specified URL for a validated canonical course.
 */
async function fetchRawIcalData(
  canonicalCourse: string,
  signal?: AbortSignal
): Promise<string> {
  const icalUrl = generateIcalUrl(canonicalCourse);
  const controller = new AbortController();
  const onCallerAbort = () => controller.abort();
  let exceededSizeLimit = false;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  const abortForSizeLimit = () => {
    exceededSizeLimit = true;
    controller.abort();
  };

  try {
    const response = await fetch(icalUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new CalendarError(CalendarErrorCode.Http, {
        status: response.status,
        statusText: response.statusText || undefined,
      });
    }
    const contentLengthHeader = response.headers?.get('content-length');
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_ICAL_BYTES) {
        abortForSizeLimit();
        await response.body?.cancel?.().catch(() => {});
        throw new CalendarError(CalendarErrorCode.Parse);
      }
    }
    return await readResponseTextWithinLimit(
      response,
      MAX_ICAL_BYTES,
      abortForSizeLimit
    );
  } catch (error) {
    if (error instanceof CalendarError) throw error;
    if (exceededSizeLimit) {
      throw new CalendarError(CalendarErrorCode.Parse, { cause: error });
    }
    if (isAbortError(error, signal)) throw error;
    console.warn('Calendar fetch failed:', error);
    throw new CalendarError(CalendarErrorCode.Network, { cause: error });
  } finally {
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

/**
 * Mapping of common Windows time zone IDs (as emitted by MS Exchange) to IANA TZIDs.
 * We only map those that we expect from DHBW calendars. Extend as needed.
 */
const WINDOWS_TO_IANA_TZID: Record<string, string> = {
  // Germany/Switzerland/Austria
  'W. Europe Standard Time': 'Europe/Berlin',
  'Central European Standard Time': 'Europe/Warsaw', // fallback; not expected for DHBW
};

/**
 * Minimal but robust VTIMEZONE component for Europe/Berlin covering DST rules since 1970.
 * Injected when no compatible VTIMEZONE exists and events reference Europe/Berlin.
 */
const EUROPE_BERLIN_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Berlin',
  'X-LIC-LOCATION:Europe/Berlin',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\n');

let fallbackEuropeBerlinTimezone: unknown | null = null;

function getFallbackEuropeBerlinTimezone(): unknown {
  if (!fallbackEuropeBerlinTimezone) {
    const vcal = new ICAL.Component(
      ICAL.parse(`BEGIN:VCALENDAR\n${EUROPE_BERLIN_VTIMEZONE}\nEND:VCALENDAR`)
    );
    const vtz = vcal.getFirstSubcomponent('vtimezone');
    fallbackEuropeBerlinTimezone = new (ICAL as any).Timezone({
      component: vtz,
      tzid: CALENDAR_TIMEZONE,
    });
  }
  return fallbackEuropeBerlinTimezone;
}

/**
 * Unfolds RFC 5545 folded content lines and normalizes Windows TZIDs to IANA.
 * VTIMEZONE fallback registration is performed after `ICAL.parse` on the actual
 * parsed VTIMEZONE subcomponents so folded DESCRIPTION text can never spoof a
 * VTIMEZONE block.
 */
function normalizeTimezones(icalText: string): string {
  // Unfold RFC 5545 continuation lines (CRLF/LF followed by SPACE or HTAB) in linear time.
  let normalized = icalText.replace(/\r?\n[ \t]/g, '');

  // Replace TZID parameters and values used by event properties (DTSTART;TZID=..., EXDATE;TZID=...)
  for (const [winTz, ianaTz] of Object.entries(WINDOWS_TO_IANA_TZID)) {
    // Parameter form: TZID=W. Europe Standard Time
    const paramRe = new RegExp(
      `(TZID=)${winTz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[;:])`,
      'g'
    );
    normalized = normalized.replace(paramRe, `$1${ianaTz}`);

    // Property form inside VTIMEZONE: TZID:W. Europe Standard Time
    const propRe = new RegExp(
      `(TZID:)${winTz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\r?\n)`,
      'g'
    );
    normalized = normalized.replace(propRe, `$1${ianaTz}`);
  }

  return normalized;
}

/**
 * Registers the VTIMEZONE components found in the parsed calendar with the ICAL
 * TimezoneService, and ensures our built-in Europe/Berlin fallback is registered
 * whenever the calendar does not declare its own Europe/Berlin VTIMEZONE.
 */
function registerTimezone(vcalendar: ICAL.Component): void {
  const tzComps = vcalendar.getAllSubcomponents('vtimezone') ?? [];
  let hasBerlinVTimezone = false;

  tzComps.forEach((timezoneComp) => {
    const tzid = timezoneComp.getFirstPropertyValue('tzid');
    if (typeof tzid !== 'string' || !tzid || PROTECTED_TZIDS.has(tzid)) {
      // Remove malformed or built-in VTIMEZONE blocks so ical.js's tree scan
      // does not crash on missing TZID or override built-in Z/UTC/GMT zones.
      vcalendar.removeSubcomponent(timezoneComp);
      return;
    }
    try {
      const timezone = new (ICAL as any).Timezone({
        component: timezoneComp,
        tzid,
      });
      (ICAL as any).TimezoneService.register(tzid, timezone);
      if (tzid === CALENDAR_TIMEZONE) {
        hasBerlinVTimezone = true;
      }
    } catch (e) {
      // If registration fails, ignore and continue with others
      console.warn('Failed to register VTIMEZONE for tzid', tzid, e);
    }
  });

  if (!hasBerlinVTimezone) {
    try {
      (ICAL as any).TimezoneService.register(
        CALENDAR_TIMEZONE,
        getFallbackEuropeBerlinTimezone()
      );
    } catch (e) {
      console.warn('Failed to register fallback Europe/Berlin VTIMEZONE', e);
    }
  }
}

function berlinDayKeyForIcalTime(time: ICAL.Time): string {
  return time.isDate
    ? ymdFromIcalDate(time)
    : BERLIN_YMD_FORMATTER.format(time.toJSDate());
}

/**
 * Collects all recurrence exceptions for buggy MS-Exchange exports.
 *
 * Problem: For exceptions inside a recurring series, Exchange omits the time
 * part of the RECURRENCE-ID. iCal.js therefore cannot match these exceptions
 * with their parent event. By caching the affected Berlin calendar dates we can
 * later ignore the automatically generated occurrence for that day (the real,
 * modified event will be added separately because it shows up as its own VEVENT).
 */
function getRecurrenceExceptions(
  vevents: ICAL.Component[]
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);
    if (event.isRecurrenceException()) {
      let dates = result.get(event.uid);
      if (!dates) {
        dates = new Set<string>();
        result.set(event.uid, dates);
      }
      dates.add(berlinDayKeyForIcalTime(event.recurrenceId));
    }
  });

  return result;
}

function isAsciiWhitespace(code: number): boolean {
  return (
    code === 32 || // ' '
    code === 9 || // '\t'
    code === 10 || // '\n'
    code === 13 || // '\r'
    code === 12 // '\f'
  );
}

/**
 * Removes complete HTML comments (`<!-- ... -->`), including Outlook
 * `<!--[if ...]> ... <![endif]-->` blocks, in guaranteed linear time.
 */
function stripHtmlComments(input: string): string {
  let current = input;

  for (let pass = 0; pass < MAX_HTML_COMMENT_PASSES; pass += 1) {
    let cursor = 0;
    let changed = false;
    const parts: string[] = [];

    while (cursor < current.length) {
      const start = current.indexOf('<!--', cursor);
      if (start === -1) break;

      const end = current.indexOf('-->', start + 4);
      if (end === -1) break;

      parts.push(current.slice(cursor, start));
      cursor = end + 3;
      changed = true;
    }

    if (!changed) break;
    parts.push(current.slice(cursor));
    current = parts.join('');
  }

  return current;
}

/**
 * Removes downlevel-revealed conditional comment markers (`<![if !mso]>`,
 * `<![endif]-->`) that Exchange leaves behind in plain-text DESCRIPTION values.
 * Runs in strictly linear time without regex backtracking.
 */
function stripConditionalCommentMarkers(input: string): string {
  let cursor = 0;
  let closeBracket = -1;
  let markerEnd = -1;
  const parts: string[] = [];

  while (cursor < input.length) {
    const start = input.indexOf('<![', cursor);
    if (start === -1) break;

    if (closeBracket < start + 3) {
      closeBracket = input.indexOf(']', start + 3);
      if (closeBracket === -1) break;

      let end = closeBracket + 1;
      while (end < input.length && isAsciiWhitespace(input.charCodeAt(end))) {
        end += 1;
      }

      if (input.startsWith('-->', end)) {
        markerEnd = end + 3;
      } else if (input.charCodeAt(end) === 62 /* '>' */) {
        markerEnd = end + 1;
      } else {
        markerEnd = -1;
      }
    }

    let pos = start + 3;
    while (pos < closeBracket && isAsciiWhitespace(input.charCodeAt(pos))) {
      pos += 1;
    }

    const remaining = closeBracket - pos;
    const isConditional =
      (remaining >= 5 && input.slice(pos, pos + 5).toLowerCase() === 'endif') ||
      (remaining >= 2 && input.slice(pos, pos + 2).toLowerCase() === 'if');

    if (isConditional && markerEnd !== -1) {
      parts.push(input.slice(cursor, start));
      cursor = markerEnd;
    } else {
      parts.push(input.slice(cursor, start + 3));
      cursor = start + 3;
    }
  }

  if (parts.length === 0) return input;
  parts.push(input.slice(cursor));
  return parts.join('');
}

/**
 * Strips HTML comment leftovers from Exchange-generated DESCRIPTION values and
 * discards descriptions that carry nothing but markup and whitespace.
 */
function sanitizeDescription(
  rawDescription: string | null | undefined
): string | undefined {
  if (!rawDescription) return undefined;

  const cleaned = stripConditionalCommentMarkers(
    stripHtmlComments(rawDescription)
  ).trim();

  return cleaned.length > 0 ? cleaned : undefined;
}

type RecurrencePlan =
  | { kind: 'skip' }
  | {
      kind: 'expand';
      /**
       * Lazily constructs the iterator only when the budgeted expansion loop
       * actually reaches this series, avoiding up-front RDATE/EXDATE/RRULE work
       * when the shared budget is already exhausted.
       */
      createIterator: () => ICAL.RecurExpansion;
      /**
       * True when the expansion starts inside or aligned right before the
       * visible window (or is known to overlap via UNTIL/RDATE).
       */
      prioritized: boolean;
      /**
       * Original DTSTART timestamp for ordering fallback series (most recent
       * DTSTART first so active semester series always run before old ones).
       */
      startMs: number;
    };

const ICAL_WEEKDAY_NUMBER: Record<string, number> = {
  SU: 1,
  MO: 2,
  TU: 3,
  WE: 4,
  TH: 5,
  FR: 6,
  SA: 7,
};

function parsePlainByDaySet(
  parts: Record<string, unknown>
): Set<number> | null {
  const keys = Object.keys(parts);
  if (keys.length !== 1 || keys[0] !== 'BYDAY') return null;
  const raw = parts.BYDAY;
  const items = Array.isArray(raw) ? raw : [raw];
  if (items.length === 0) return null;

  const set = new Set<number>();
  for (const item of items) {
    if (typeof item !== 'string') return null;
    const dow = ICAL_WEEKDAY_NUMBER[item.toUpperCase()];
    if (!dow) return null; // Reject ordinal forms like 2MO or -1FR
    set.add(dow);
  }
  return set;
}

/**
 * Computes an exact fast-forward anchor and skipped occurrence count for
 * DAILY or WEEKLY rules with plain BYDAY filters (e.g. `BYDAY=MO,TU,WE,TH,FR`)
 * and COUNT. Returns `null` if no full cycles can be skipped.
 */
function computeByDayCountSkip(
  start: ICAL.Time,
  recur: ICAL.Recur,
  bydaySet: Set<number>,
  daysDiff: number
): { anchor: ICAL.Time; skipped: number } | null {
  const interval = Math.max(1, recur.interval || 1);
  const k = bydaySet.size;
  const startDow = start.dayOfWeek(); // 1 (SU) .. 7 (SA)

  if (recur.freq === 'WEEKLY') {
    const wkst = recur.wkst || 2; // default MONDAY = 2
    const offsetInWeek = (startDow - wkst + 7) % 7;

    // DTSTART is always occurrence #1; count any remaining matching weekdays in DTSTART's week.
    let firstWeekCount = 1;
    for (let o = offsetInWeek + 1; o < 7; o += 1) {
      const dow = ((wkst - 1 + o) % 7) + 1;
      if (bydaySet.has(dow)) firstWeekCount += 1;
    }

    const daysToNextActiveWeek = 7 * interval - offsetInWeek;
    const cycleDays = 7 * interval;
    const remDays = daysDiff - daysToNextActiveWeek;
    const fullCycles = Math.floor((remDays - cycleDays - 2) / cycleDays);
    if (fullCycles < 0) return null;

    const totalSkipped = firstWeekCount + fullCycles * k;
    let firstMatchOffset = 0;
    for (let o = 0; o < 7; o += 1) {
      const dow = ((wkst - 1 + o) % 7) + 1;
      if (bydaySet.has(dow)) {
        firstMatchOffset = o;
        break;
      }
    }

    const totalAdvanceDays =
      daysToNextActiveWeek + fullCycles * cycleDays + firstMatchOffset;
    if (totalAdvanceDays <= 0) return null;

    const anchor = start.clone();
    anchor.adjust(totalAdvanceDays, 0, 0, 0);
    return { anchor, skipped: totalSkipped };
  }

  if (recur.freq === 'DAILY') {
    if (interval % 7 === 0) {
      if (!bydaySet.has(startDow)) {
        // Only DTSTART itself ever occurs, which is already before windowStart.
        return { anchor: start.clone(), skipped: Number.MAX_SAFE_INTEGER };
      }
      const steps = Math.floor((daysDiff - interval - 2) / interval);
      if (steps <= 0) return null;
      const anchor = start.clone();
      anchor.adjust(steps * interval, 0, 0, 0);
      return { anchor, skipped: steps };
    }

    let prefixCount = 0;
    let firstBlockOffsetDays = 0;
    if (!bydaySet.has(startDow)) {
      prefixCount = 1;
      for (let s = 1; s < 7; s += 1) {
        const dow = ((startDow - 1 + s * interval) % 7) + 1;
        if (bydaySet.has(dow)) {
          firstBlockOffsetDays = s * interval;
          break;
        }
      }
    }

    const blockDays = 7 * interval;
    const remDays = daysDiff - firstBlockOffsetDays;
    const fullBlocks = Math.floor((remDays - blockDays - 2) / blockDays);
    if (fullBlocks <= 0) return null;

    const anchor = start.clone();
    anchor.adjust(firstBlockOffsetDays + fullBlocks * blockDays, 0, 0, 0);
    return { anchor, skipped: prefixCount + fullBlocks * k };
  }

  return null;
}

function hasRdateOnOrAfter(vevent: ICAL.Component, minDate: Date): boolean {
  for (const prop of vevent.getAllProperties('rdate')) {
    for (const value of prop.getValues()) {
      if (value instanceof ICAL.Time && value.toJSDate() >= minDate) {
        return true;
      }
    }
  }
  return false;
}

function createCustomRecurrenceIterator(
  vevent: ICAL.Component,
  dtstart: ICAL.Time,
  adjustedRecur: ICAL.Recur | null
): ICAL.RecurExpansion {
  const iterComp = new ICAL.Component('vevent');
  if (adjustedRecur) {
    iterComp.addPropertyWithValue('rrule', adjustedRecur);
  }
  for (const prop of vevent.getAllProperties('rdate')) {
    iterComp.addProperty(prop);
  }
  for (const prop of vevent.getAllProperties('exdate')) {
    iterComp.addProperty(prop);
  }
  return new ICAL.RecurExpansion({ component: iterComp, dtstart });
}

/**
 * Computes a lazy expansion plan for a recurring VEVENT without instantiating
 * `ICAL.RecurExpansion` up front:
 * - Skips series whose RRULE ended before `windowStart` (unless an RDATE still
 *   falls inside the window, in which case only RDATEs are expanded).
 * - Fast-forwards old DAILY/WEEKLY/MONTHLY/YEARLY RRULEs (including simple
 *   COUNT series, plain DAILY/WEEKLY BYDAY+COUNT series, and series with
 *   RDATEs) to an aligned anchor just before `windowStart`, preserving
 *   timezone, wall-clock time, INTERVAL phase, remaining COUNT, and RDATE/EXDATE.
 * - Flags series that start in/near or are known to overlap the visible window
 *   as prioritized; remaining fallback series are ordered newest-DTSTART-first.
 */
function buildRecurrencePlan(
  vevent: ICAL.Component,
  event: ICAL.Event,
  windowStart: Date
): RecurrencePlan {
  const start = event.startDate;
  if (!start) return { kind: 'skip' };

  const startMs = start.toJSDate().getTime();
  if (startMs >= windowStart.getTime()) {
    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: true,
      startMs,
    };
  }

  const rrules = vevent.getAllProperties('rrule');
  if (rrules.length !== 1) {
    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: false,
      startMs,
    };
  }

  const recur = rrules[0].getFirstValue() as ICAL.Recur | null;
  if (!recur) {
    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: false,
      startMs,
    };
  }

  const hasRdate = vevent.hasProperty('rdate');
  const hasVisibleRdate = hasRdate && hasRdateOnOrAfter(vevent, windowStart);

  if (recur.until && recur.until.toJSDate() < windowStart) {
    if (!hasVisibleRdate) return { kind: 'skip' };
    return {
      kind: 'expand',
      createIterator: () => createCustomRecurrenceIterator(vevent, start, null),
      prioritized: true,
      startMs,
    };
  }

  const hasCount = recur.count != null;
  const parts = (recur.parts ?? {}) as Record<string, unknown>;
  const hasByParts = Object.keys(parts).length > 0;
  const interval = Math.max(1, recur.interval || 1);
  const startYmd = ymdFromIcalDate(start);
  const windowYmd = BERLIN_YMD_FORMATTER.format(windowStart);
  const daysDiff = Math.floor(
    (utcDayKeyFromYmd(windowYmd) - utcDayKeyFromYmd(startYmd)) / MS_IN_DAY
  );
  if (!Number.isFinite(daysDiff) || daysDiff <= 0) {
    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: true,
      startMs,
    };
  }

  if (hasCount && hasByParts) {
    const plainByDaySet = parsePlainByDaySet(parts);
    if (plainByDaySet) {
      const result = computeByDayCountSkip(
        start,
        recur,
        plainByDaySet,
        daysDiff
      );
      if (result) {
        const remainingCount = (recur.count as number) - result.skipped;
        if (remainingCount <= 0) {
          if (!hasVisibleRdate) return { kind: 'skip' };
          return {
            kind: 'expand',
            createIterator: () =>
              createCustomRecurrenceIterator(vevent, start, null),
            prioritized: true,
            startMs,
          };
        }
        return {
          kind: 'expand',
          createIterator: () => {
            const adjustedRecur = recur.clone();
            adjustedRecur.count = remainingCount;
            return createCustomRecurrenceIterator(
              vevent,
              result.anchor,
              adjustedRecur
            );
          },
          prioritized: true,
          startMs,
        };
      }
      // Plain BYDAY+COUNT series started recently enough that 0 full cycles
      // needed skipping (e.g. active semester series starting a few months ago).
      return {
        kind: 'expand',
        createIterator: () => event.iterator(),
        prioritized: true,
        startMs,
      };
    }

    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: false,
      startMs,
    };
  }

  let steps = 0;
  let anchor: ICAL.Time | null = null;

  if (recur.freq === 'DAILY') {
    const marginDays = interval + 2;
    steps = Math.floor((daysDiff - marginDays) / interval);
    if (steps > 0) {
      anchor = start.clone();
      anchor.adjust(steps * interval, 0, 0, 0);
    }
  } else if (recur.freq === 'WEEKLY') {
    const cycleDays = 7 * interval;
    const marginDays = cycleDays + 2;
    steps = Math.floor((daysDiff - marginDays) / cycleDays);
    if (steps > 0) {
      anchor = start.clone();
      anchor.adjust(steps * cycleDays, 0, 0, 0);
    }
  } else if (recur.freq === 'MONTHLY' && start.day <= 28) {
    const [wy, wm] = windowYmd.split('-').map(Number);
    const monthsDiff = (wy - start.year) * 12 + (wm - start.month);
    steps = Math.floor((monthsDiff - interval - 1) / interval);
    if (steps > 0) {
      anchor = start.clone();
      const targetMonthIndex =
        start.year * 12 + (start.month - 1) + steps * interval;
      anchor.year = Math.floor(targetMonthIndex / 12);
      anchor.month = (targetMonthIndex % 12) + 1;
      anchor.adjust(0, 0, 0, 0);
    }
  } else if (
    recur.freq === 'YEARLY' &&
    !(start.month === 2 && start.day === 29)
  ) {
    const [wy] = windowYmd.split('-').map(Number);
    const yearsDiff = wy - start.year;
    steps = Math.floor((yearsDiff - interval - 1) / interval);
    if (steps > 0) {
      anchor = start.clone();
      anchor.year = start.year + steps * interval;
      anchor.adjust(0, 0, 0, 0);
    }
  }

  if (!anchor || steps <= 0) {
    return {
      kind: 'expand',
      createIterator: () => event.iterator(),
      prioritized: false,
      startMs,
    };
  }

  if (hasCount) {
    const remainingCount = (recur.count as number) - steps;
    if (remainingCount <= 0) {
      if (!hasVisibleRdate) return { kind: 'skip' };
      return {
        kind: 'expand',
        createIterator: () =>
          createCustomRecurrenceIterator(vevent, start, null),
        prioritized: true,
        startMs,
      };
    }

    return {
      kind: 'expand',
      createIterator: () => {
        const adjustedRecur = recur.clone();
        adjustedRecur.count = remainingCount;
        return createCustomRecurrenceIterator(vevent, anchor, adjustedRecur);
      },
      prioritized: true,
      startMs,
    };
  }

  return {
    kind: 'expand',
    createIterator: () => event.iterator(anchor),
    prioritized: true,
    startMs,
  };
}

/**
 * Emits a timed event (single or recurring occurrence), splitting multi-day
 * spans into per-day Berlin slices capped by `resolveCappedDayRange`.
 * Uses actual start/end instants so DURATION:P...W and recurring multi-day
 * timed events follow the exact same bounds as DTSTART/DTEND single events.
 */
function emitTimedEvent(args: {
  uidPrefix: string;
  singleUid: string;
  title: string;
  jsStart: Date;
  jsEnd: Date;
  location: string;
  description: string | undefined;
  windowBounds: { startKey: string; endKey: string };
  skipOutOfWindow: boolean;
  pushEvent: (event: TimetableEvent) => boolean;
  onOutOfWindowSkipped: () => void;
}): boolean {
  const {
    uidPrefix,
    singleUid,
    title,
    jsStart,
    jsEnd,
    location,
    description,
    windowBounds,
    skipOutOfWindow,
    pushEvent,
    onOutOfWindowSkipped,
  } = args;

  const durationMs = jsEnd.getTime() - jsStart.getTime();
  const startKey = BERLIN_YMD_FORMATTER.format(jsStart);
  const endKey =
    durationMs > 0
      ? BERLIN_YMD_FORMATTER.format(new Date(jsEnd.getTime() - 1))
      : startKey;
  const effectiveEndKey = endKey >= startKey ? endKey : startKey;

  const isMultiDayOrFullDay =
    effectiveEndKey > startKey || durationMs >= 23 * 60 * 60 * 1000;

  if (!isMultiDayOrFullDay) {
    return pushEvent({
      uid: singleUid,
      title,
      start: jsStart,
      end: jsEnd,
      location,
      description,
      allDay: false,
    });
  }

  if (
    skipOutOfWindow &&
    (effectiveEndKey < windowBounds.startKey || startKey > windowBounds.endKey)
  ) {
    onOutOfWindowSkipped();
    return true;
  }

  const { startDay, dayCount } = resolveCappedDayRange(
    startKey,
    effectiveEndKey,
    windowBounds
  );

  let sliceDayStart = berlinMidnight(startDay);
  for (let offset = 0; offset < dayCount; offset += 1) {
    const sliceDayEnd = berlinMidnight(addDaysToYmd(startDay, offset + 1));

    // Intersect [jsStart, jsEnd] with [sliceDayStart, sliceDayEnd] so every
    // slice stays strictly within its calendar day even when clipped.
    const sliceStart =
      jsStart.getTime() > sliceDayStart.getTime() ? jsStart : sliceDayStart;
    const sliceEnd =
      jsEnd.getTime() < sliceDayEnd.getTime() ? jsEnd : sliceDayEnd;

    // Mark as allDay when this slice cleanly spans one full calendar day
    // (00:00 → next 00:00), including 23/25h days around DST changes.
    const sliceAllDay =
      sliceStart.getTime() === sliceDayStart.getTime() &&
      sliceEnd.getTime() === sliceDayEnd.getTime();

    if (
      !pushEvent({
        uid: `${uidPrefix}-${offset}`,
        title,
        start: sliceStart,
        end: sliceEnd,
        location,
        description,
        allDay: sliceAllDay,
      })
    ) {
      return false;
    }

    sliceDayStart = sliceDayEnd;
  }

  return true;
}

/**
 * Parses the iCal text, expands recurring events (including Exchange quirks),
 * splits multi‑day events, and returns a flat list.
 */
function parseAndTransformIcal(icalText: string): TimetableEvent[] {
  // Normalize Windows TZIDs to IANA and ensure necessary VTIMEZONEs exist
  const prepared = normalizeTimezones(icalText);
  const jcalData = ICAL.parse(prepared);
  const vcalendar = new ICAL.Component(jcalData);

  // Ensure calendar timezone is registered before touching dates
  registerTimezone(vcalendar);

  const vevents = vcalendar.getAllSubcomponents('vevent');
  const recurrenceExceptions = getRecurrenceExceptions(vevents);

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 7);
  const rangeEnd = new Date();
  rangeEnd.setFullYear(now.getFullYear() + 1);
  const windowBounds = {
    startKey: BERLIN_YMD_FORMATTER.format(windowStart),
    endKey: BERLIN_YMD_FORMATTER.format(rangeEnd),
  };

  // Keep in-window events separate from out-of-window events so historical
  // entries earlier in the feed can never crowd out current or upcoming ones.
  const inWindowEvents: TimetableEvent[] = [];
  const outOfWindowEvents: TimetableEvent[] = [];
  let truncated = false;
  let totalRecurrenceIterations = 0;

  // Returns false only when the in-window limit is reached and the caller should
  // stop producing events. Out-of-window events beyond their limit are dropped
  // silently so later in-window slices of the same event are still collected.
  const pushEvent = (event: TimetableEvent): boolean => {
    const isInWindow =
      event.end.getTime() >= windowStart.getTime() &&
      event.start.getTime() <= rangeEnd.getTime();
    if (isInWindow) {
      if (inWindowEvents.length >= MAX_PARSED_EVENTS) {
        truncated = true;
        return false;
      }
      inWindowEvents.push(event);
      return true;
    }

    if (outOfWindowEvents.length >= MAX_PARSED_EVENTS) {
      truncated = true;
      return true;
    }
    outOfWindowEvents.push(event);
    return true;
  };

  interface PendingRecurring {
    event: ICAL.Event;
    hasExplicitEnd: boolean;
    createIterator: () => ICAL.RecurExpansion;
    startMs: number;
  }

  const prioritizedRecurring: PendingRecurring[] = [];
  const historicalRecurring: PendingRecurring[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const hasExplicitEnd = vevent.hasProperty('dtend');

    // 1️⃣ Queue recurring master events so current/window-aligned series expand
    // before historical fallback series can consume the shared iteration budget.
    if (event.isRecurring()) {
      const plan = buildRecurrencePlan(vevent, event, windowStart);
      if (plan.kind === 'skip') continue;
      const pending: PendingRecurring = {
        event,
        hasExplicitEnd,
        createIterator: plan.createIterator,
        startMs: plan.startMs,
      };
      if (plan.prioritized) {
        prioritizedRecurring.push(pending);
      } else {
        historicalRecurring.push(pending);
      }
      continue;
    }

    // 2️⃣ All-day single events → one slice per Berlin calendar day
    if (event.startDate.isDate) {
      const firstDay = ymdFromIcalDate(event.startDate);
      const lastDay = hasExplicitEnd
        ? ymdFromIcalDate(event.endDate)
        : addDaysToYmd(ymdFromIcalDate(event.endDate), -1);
      const effectiveLastDay = lastDay >= firstDay ? lastDay : firstDay;

      if (
        outOfWindowEvents.length >= MAX_PARSED_EVENTS &&
        (effectiveLastDay < windowBounds.startKey ||
          firstDay > windowBounds.endKey)
      ) {
        truncated = true;
        continue;
      }

      for (const [offset, slice] of allDaySlices(
        event.startDate,
        event.endDate,
        hasExplicitEnd,
        windowBounds
      ).entries()) {
        if (
          !pushEvent({
            uid: `${event.uid}-${offset}`,
            title: event.summary,
            start: slice.start,
            end: slice.end,
            location: event.location || '',
            description: sanitizeDescription(event.description),
            allDay: true,
          })
        ) {
          break;
        }
      }
      continue;
    }

    // 3️⃣ Single (and multi-day) timed events
    emitTimedEvent({
      uidPrefix: event.uid,
      singleUid: `${event.uid}-${event.startDate.toString()}`,
      title: event.summary,
      jsStart: event.startDate.toJSDate(),
      jsEnd: event.endDate.toJSDate(),
      location: event.location || '',
      description: sanitizeDescription(event.description),
      windowBounds,
      skipOutOfWindow: outOfWindowEvents.length >= MAX_PARSED_EVENTS,
      pushEvent,
      onOutOfWindowSkipped: () => {
        truncated = true;
      },
    });
  }

  // Order fallback historical series newest-DTSTART-first so active semester
  // series that couldn't be fast-forwarded still run before ancient ones.
  historicalRecurring.sort((a, b) => b.startMs - a.startMs);

  for (const pending of [...prioritizedRecurring, ...historicalRecurring]) {
    const { event, hasExplicitEnd, createIterator } = pending;
    if (
      inWindowEvents.length >= MAX_PARSED_EVENTS ||
      totalRecurrenceIterations >= MAX_TOTAL_RECURRENCE_ITERATIONS
    ) {
      truncated = true;
      continue;
    }

    // Account for iterator initialization inside the shared budget and create
    // the iterator lazily so skipped series incur zero ical.js setup work.
    totalRecurrenceIterations += 1;
    const iterator = createIterator();
    let next: ICAL.Time | null;
    let iterations = 0;

    while ((next = iterator.next())) {
      iterations += 1;
      totalRecurrenceIterations += 1;
      if (
        iterations > MAX_RECURRENCE_ITERATIONS_PER_EVENT ||
        totalRecurrenceIterations > MAX_TOTAL_RECURRENCE_ITERATIONS
      ) {
        truncated = true;
        break;
      }

      const nextDate = next.toJSDate();
      if (nextDate > rangeEnd) break;
      if (nextDate < windowStart) continue;
      // Skip buggy Exchange duplicates – the real exception VEVENT will follow.
      const occurrenceDayKey = next.isDate
        ? ymdFromIcalDate(next)
        : BERLIN_YMD_FORMATTER.format(nextDate);
      if (recurrenceExceptions.get(event.uid)?.has(occurrenceDayKey)) {
        continue;
      }

      const occurrence = event.getOccurrenceDetails(next);
      const occStart = occurrence.startDate;
      const occEnd = occurrence.endDate;
      const occurrenceKey = next.toString();
      if (occStart.isDate) {
        let limitReached = false;
        for (const [offset, slice] of allDaySlices(
          occStart,
          occEnd,
          hasExplicitEnd,
          windowBounds
        ).entries()) {
          if (
            !pushEvent({
              uid: `${event.uid}-${occurrenceKey}-${offset}`,
              title: occurrence.item.summary,
              start: slice.start,
              end: slice.end,
              location: occurrence.item.location || '',
              description: sanitizeDescription(occurrence.item.description),
              allDay: true,
            })
          ) {
            limitReached = true;
            break;
          }
        }
        if (limitReached) break;
        continue;
      }

      if (
        !emitTimedEvent({
          uidPrefix: `${event.uid}-${occurrenceKey}`,
          singleUid: `${event.uid}-${occurrenceKey}`,
          title: occurrence.item.summary,
          jsStart: occStart.toJSDate(),
          jsEnd: occEnd.toJSDate(),
          location: occurrence.item.location || '',
          description: sanitizeDescription(occurrence.item.description),
          windowBounds,
          skipOutOfWindow: outOfWindowEvents.length >= MAX_PARSED_EVENTS,
          pushEvent,
          onOutOfWindowSkipped: () => {
            truncated = true;
          },
        })
      ) {
        break;
      }
    }
  }

  const remainingCapacity = Math.max(
    0,
    MAX_PARSED_EVENTS - inWindowEvents.length
  );
  if (outOfWindowEvents.length > remainingCapacity) {
    truncated = true;
  }
  if (truncated) {
    console.warn(
      'Calendar parsing hit safety limits; some events were omitted.'
    );
  }

  return inWindowEvents.concat(outOfWindowEvents.slice(0, remainingCapacity));
}

/**
 * Groups events by calendar day in chronological order.
 */
function structureEventsByDay(events: TimetableEvent[]): StructuredTimetable {
  const structured: StructuredTimetable = {};

  // Chronological order makes UI rendering trivial
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  events.forEach((event) => {
    const dateKey = BERLIN_YMD_FORMATTER.format(event.start); // → YYYY-MM-DD in Europe/Berlin
    if (!structured[dateKey]) structured[dateKey] = [];
    structured[dateKey].push(event);
  });

  return structured;
}

/**
 * Orchestrator – fetches, parses and structures the course timetable for a specific course.
 */
export async function getStructuredTimetable(
  course: string,
  signal?: AbortSignal
): Promise<StructuredTimetable> {
  const canonical = normalizeAndValidateCourse(course);
  if (!canonical) {
    throw new CalendarError(CalendarErrorCode.InvalidCourse);
  }

  const raw = await fetchRawIcalData(canonical, signal);
  try {
    const flatEvents = parseAndTransformIcal(raw);
    return structureEventsByDay(flatEvents);
  } catch (error) {
    console.warn('Calendar parsing failed:', error);
    throw new CalendarError(CalendarErrorCode.Parse, { cause: error });
  }
}

// Test helper: parse raw ICS to flat events (used by local verification script)
export function __parseIcalForTest(icalText: string): TimetableEvent[] {
  return parseAndTransformIcal(icalText);
}
