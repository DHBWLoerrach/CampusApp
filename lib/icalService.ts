import ICAL from 'ical.js';

// --- Type Definitions ---

// Defines the structure of a single parsed event.
export interface TimetableEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  // True when the source ICS used a DATE (all-day) rather than DATE-TIME
  allDay?: boolean;
}

// Defines the final data structure for the UI: a key‑value map
// where the key is a date string ('YYYY-MM-DD') and the value is an array of events.
export interface StructuredTimetable {
  [dateKey: string]: TimetableEvent[];
}

/**
 * Generates the iCal URL for a given course.
 */
function generateIcalUrl(course: string): string {
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

/**
 * Validates if a course exists by checking if the iCal URL is accessible.
 */
export async function validateCourse(
  course: string
): Promise<boolean> {
  if (!course || course.trim() === '') {
    return false;
  }

  try {
    const icalUrl = generateIcalUrl(course.trim());
    const response = await fetch(icalUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Course validation failed:', error);
    return false;
  }
}

/**
 * Fetches the raw iCal data from the specified URL for a given course.
 */
async function fetchRawIcalData(course: string): Promise<string> {
  const icalUrl = generateIcalUrl(course);
  const response = await fetch(icalUrl);
  if (!response.ok) {
    throw new Error(
      `Network response was not ok: ${response.statusText}`
    );
  }
  return response.text();
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

/**
 * Normalizes Windows TZIDs to IANA and ensures a suitable VTIMEZONE is available.
 * This helps ical.js to compute correct offsets for DTSTART/DTEND/EXDATE, even when
 * Exchange uses Windows TZIDs that are not known to iCal.js by default.
 */
function normalizeTimezones(icalText: string): string {
  let normalized = icalText;

  // Replace TZID parameters and values used by event properties (DTSTART;TZID=..., EXDATE;TZID=...)
  for (const [winTz, ianaTz] of Object.entries(
    WINDOWS_TO_IANA_TZID
  )) {
    // Parameter form: TZID=W. Europe Standard Time
    const paramRe = new RegExp(
      `(TZID=)${winTz.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )}(?=[;:])`,
      'g'
    );
    normalized = normalized.replace(paramRe, `$1${ianaTz}`);

    // Property form inside VTIMEZONE: TZID:W. Europe Standard Time
    const propRe = new RegExp(
      `(TZID:)${winTz.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )}(?=\r?\n)`,
      'g'
    );
    normalized = normalized.replace(propRe, `$1${ianaTz}`);
  }

  // If events now reference Europe/Berlin but no such VTIMEZONE exists, inject one.
  const referencesBerlin =
    /TZID=Europe\/Berlin|TZID:Europe\/Berlin/.test(normalized);
  const hasBerlinVTimezone =
    /BEGIN:VTIMEZONE[\s\S]*?TZID:Europe\/Berlin[\s\S]*?END:VTIMEZONE/.test(
      normalized
    );
  if (referencesBerlin && !hasBerlinVTimezone) {
    // Insert after BEGIN:VCALENDAR to keep calendar valid.
    normalized = normalized.replace(
      /BEGIN:VCALENDAR\r?\n/,
      (match) => `${match}${EUROPE_BERLIN_VTIMEZONE}\n`
    );
  }

  return normalized;
}

/**
 * Registers the first VTIMEZONE found in the calendar with the ICAL TimezoneService.
 * MS Exchange calendars almost always include exactly one VTIMEZONE component.
 * Doing this once up‑front ensures that all date conversions are interpreted in
 * the calendar's native timezone instead of defaulting to local/UTC.
 */
function registerTimezone(vcalendar: ICAL.Component): void {
  const tzComps = vcalendar.getAllSubcomponents('vtimezone');
  if (!tzComps || tzComps.length === 0) return;

  tzComps.forEach((timezoneComp) => {
    const tzid = timezoneComp.getFirstPropertyValue('tzid');
    if (!tzid) return;
    try {
      const timezone = new (ICAL as any).Timezone({
        component: timezoneComp,
        tzid,
      });
      (ICAL as any).TimezoneService.register(tzid, timezone);
    } catch (e) {
      // If registration fails, ignore and continue with others
      console.warn('Failed to register VTIMEZONE for tzid', tzid, e);
    }
  });
}

/**
 * Collects all recurrence exceptions for buggy MS‑Exchange exports.
 *
 * Problem: For exceptions inside a recurring series, Exchange omits the time
 * part of the RECURRENCE‑ID. iCal.js therefore cannot match these exceptions
 * with their parent event. By caching the affected dates we can later ignore
 * the automatically generated occurrence for that day (the real, modified
 * event will be added separately because it shows up as its own VEVENT).
 */
function getRecurrenceExceptions(
  vevents: ICAL.Component[]
): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {};

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);
    if (event.isRecurrenceException()) {
      if (!result[event.uid]) result[event.uid] = new Set<string>();
      result[event.uid].add(
        event.recurrenceId.toJSDate().toDateString()
      );
    }
  });

  return result;
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
  const rangeEnd = new Date();
  rangeEnd.setFullYear(now.getFullYear() + 1);

  const allEvents: TimetableEvent[] = [];

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);

    // 1️⃣ Recurring master events
    if (event.isRecurring()) {
      // Expand from DTSTART to preserve original timezone and time-of-day
      const windowStart = new Date(now);
      windowStart.setDate(windowStart.getDate() - 7);
      const iterator = event.iterator();
      let next: ICAL.Time | null;

      // eslint-disable-next-line no-cond-assign
      while ((next = iterator.next())) {
        const nextDate = next.toJSDate();
        if (nextDate > rangeEnd) break;
        if (nextDate < windowStart) continue;
        // Skip buggy Exchange duplicates – the real exception VEVENT will follow.
        if (
          recurrenceExceptions[event.uid]?.has(
            nextDate.toDateString()
          )
        ) {
          continue;
        }

        const occurrence = event.getOccurrenceDetails(next);
        const occStart = occurrence.startDate;
        const occEnd = occurrence.endDate;
        allEvents.push({
          uid: `${event.uid}-${next.toString()}`,
          title: occurrence.item.summary,
          start: occStart.toJSDate(),
          end: occEnd.toJSDate(),
          location: occurrence.item.location || '',
          allDay: !!occStart.isDate,
        });
      }
      return; // ✅ done with recurring master; skip normal processing.
    }

    // 2️⃣ Multi‑day single events → split into one per calendar day
    if (event.duration && event.duration.days > 1) {
      for (
        let offset = 0;
        offset <= event.duration.days;
        offset += 1
      ) {
        const startDate = event.startDate.toJSDate();
        startDate.setDate(startDate.getDate() + offset);

        const endDate = event.endDate.toJSDate();
        allEvents.push({
          uid: `${event.uid}-${offset}`,
          title: event.summary,
          start: startDate,
          end: endDate,
          location: event.location || '',
          allDay: !!event.startDate.isDate,
        });
      }
      return;
    }

    // 3️⃣ Normal single (incl. recurrence‑exception) events
    allEvents.push({
      uid: `${event.uid}-${event.startDate.toString()}`,
      title: event.summary,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      location: event.location || '',
      allDay: !!event.startDate.isDate,
    });
  });

  return allEvents;
}

/**
 * Groups events by calendar day in chronological order.
 */
function structureEventsByDay(
  events: TimetableEvent[]
): StructuredTimetable {
  const structured: StructuredTimetable = {};

  // Chronological order makes UI rendering trivial
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Ensure grouping by calendar date follows the same timezone as rendering (Europe/Berlin)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  events.forEach((event) => {
    const dateKey = fmt.format(event.start); // → YYYY‑MM‑DD in Europe/Berlin
    if (!structured[dateKey]) structured[dateKey] = [];
    structured[dateKey].push(event);
  });

  return structured;
}

/**
 * Orchestrator – fetches, parses and structures the course timetable for a specific course.
 */
export async function getStructuredTimetable(
  course: string
): Promise<StructuredTimetable> {
  if (!course || course.trim() === '') {
    throw new Error('Kurs muss angegeben werden');
  }

  const raw = await fetchRawIcalData(course.trim());
  const flatEvents = parseAndTransformIcal(raw);
  return structureEventsByDay(flatEvents);
}

// Test helper: parse raw ICS to flat events (used by local verification script)
export function __parseIcalForTest(
  icalText: string
): TimetableEvent[] {
  return parseAndTransformIcal(icalText);
}
