import ICAL from 'ical.js';
import {
  todayInBerlin,
  berlinDayNumber,
  berlinMidnightForDay,
  calendarDayNumber,
} from './berlinDate.ts';
import { visitOccurrences, type Occurrence } from './icalRecurrence.ts';

// Defines the structure of a single parsed event.
export interface TimetableEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description?: string;
  // Includes full Berlin days split from a longer timed event.
  allDay?: boolean;
}

// Defines the final data structure for the UI: a key‑value map
// where the key is a date string ('YYYY-MM-DD') and the value is an array of events.
export interface StructuredTimetable {
  [dateKey: string]: TimetableEvent[];
}

const CALENDAR_TIMEZONE = 'Europe/Berlin';
// Covers the full visible window ([now - 7d, now + 1y] <= 374 days) with margin.
const MAX_EVENT_SPAN_DAYS = 380;
const MAX_PARSED_EVENTS = 10_000;
const MAX_HTML_COMMENT_PASSES = 3;
const PROTECTED_TZIDS = new Set(['Z', 'UTC', 'GMT']);
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

let fallbackEuropeBerlinTimezone: ICAL.Timezone | undefined;

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
      ICAL.TimezoneService.register(timezoneComp);
      if (tzid === CALENDAR_TIMEZONE) {
        hasBerlinVTimezone = true;
      }
    } catch (e) {
      vcalendar.removeSubcomponent(timezoneComp);
      console.warn('Failed to register VTIMEZONE for tzid', tzid, e);
    }
  });

  if (!hasBerlinVTimezone) {
    fallbackEuropeBerlinTimezone ??= new ICAL.Timezone(
      ICAL.Component.fromString(EUROPE_BERLIN_VTIMEZONE)
    );
    ICAL.TimezoneService.register(fallbackEuropeBerlinTimezone);
  }
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

interface DayWindow {
  first: number;
  last: number;
}

// Feed dates have four-digit years. The midnight ending the last day can fall in year 10000.
const LAST_ICAL_DAY = calendarDayNumber(9999, 12, 31);

type EventSlice = Pick<TimetableEvent, 'uid' | 'start' | 'end' | 'allDay'>;

/** Split DATE and DATE-TIME values at Berlin midnight, clipping long spans to the window. */
function* slicesFor(
  { start, end, uidPrefix, recurrenceKey, explicitEnd }: Occurrence,
  window: DayWindow,
  historyFull: boolean
): Generator<EventSlice> {
  let first: number;
  let last: number;
  let timedStart: Date | undefined;
  let timedEnd: Date | undefined;
  if (start.isDate) {
    first = calendarDayNumber(start.year, start.month, start.day);
    if (first > LAST_ICAL_DAY) return;
    // Exchange writes explicit DATE ends inclusively. Derived ends are exclusive.
    last =
      end.year > 9999
        ? LAST_ICAL_DAY
        : calendarDayNumber(end.year, end.month, end.day) -
          (explicitEnd ? 0 : 1);
    last = Math.max(first, last);
  } else {
    timedStart = start.toJSDate();
    timedEnd =
      end.year > 9999
        ? berlinMidnightForDay(LAST_ICAL_DAY + 1)
        : end.toJSDate();
    const duration = timedEnd.getTime() - timedStart.getTime();
    first = berlinDayNumber(timedStart);
    if (first > LAST_ICAL_DAY) return;
    last =
      duration > 0
        ? Math.min(
            LAST_ICAL_DAY,
            berlinDayNumber(new Date(timedEnd.getTime() - 1))
          )
        : first;
    if (first === last && duration < 23 * 60 * 60 * 1000) {
      yield {
        uid: uidPrefix + '-' + (recurrenceKey ?? start.toString()),
        start: timedStart,
        end: timedEnd,
        allDay: false,
      };
      return;
    }
  }

  const outside = last < window.first || first > window.last;
  if (historyFull && outside) return;
  let count = Math.max(1, last - first + 1);
  if (count > MAX_EVENT_SPAN_DAYS) {
    if (!outside) {
      if (first < window.first) first = window.first;
      if (last > window.last) last = window.last;
    }
    count = Math.min(MAX_EVENT_SPAN_DAYS, last - first + 1);
  }
  const prefix =
    recurrenceKey === undefined ? uidPrefix : uidPrefix + '-' + recurrenceKey;
  let dayStart = berlinMidnightForDay(first);
  for (let offset = 0; offset < count; offset++) {
    const dayEnd = berlinMidnightForDay(first + offset + 1);
    const sliceStart =
      timedStart && timedStart > dayStart ? timedStart : dayStart;
    const sliceEnd = timedEnd && timedEnd < dayEnd ? timedEnd : dayEnd;
    yield {
      uid: prefix + '-' + offset,
      start: sliceStart,
      end: sliceEnd,
      allDay:
        sliceStart.getTime() === dayStart.getTime() &&
        sliceEnd.getTime() === dayEnd.getTime(),
    };
    dayStart = dayEnd;
  }
}

export function parseIcal(text: string, now = new Date()) {
  const calendar = new ICAL.Component(ICAL.parse(normalizeTimezones(text)));
  registerTimezone(calendar);
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  const window = { first: berlinDayNumber(start), last: berlinDayNumber(end) };
  const visible: TimetableEvent[] = [];
  const outside: TimetableEvent[] = [];
  const metadata = new WeakMap<
    ICAL.Event,
    Pick<TimetableEvent, 'title' | 'location' | 'description'>
  >();

  const complete = visitOccurrences(
    calendar.getAllSubcomponents('vevent'),
    start,
    end,
    (occurrence) => {
      const { item } = occurrence;
      for (const slice of slicesFor(
        occurrence,
        window,
        outside.length >= MAX_PARSED_EVENTS
      )) {
        const group =
          slice.end >= start && slice.start <= end ? visible : outside;
        if (group.length >= MAX_PARSED_EVENTS) {
          if (group === visible) return false;
          continue;
        }
        let details = metadata.get(item);
        if (!details) {
          details = {
            title: item.summary,
            location: item.location || '',
            description: sanitizeDescription(item.description),
          };
          metadata.set(item, details);
        }
        group.push({ ...slice, ...details });
      }
      return true;
    }
  );
  return {
    events: visible.concat(
      outside.slice(0, MAX_PARSED_EVENTS - visible.length)
    ),
    incomplete: !complete,
  };
}

export function structureEventsByDay(
  events: TimetableEvent[]
): StructuredTimetable {
  const days: StructuredTimetable = {};
  for (const event of events.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )) {
    const day = todayInBerlin(event.start);
    (days[day] ??= []).push(event);
  }
  return days;
}
