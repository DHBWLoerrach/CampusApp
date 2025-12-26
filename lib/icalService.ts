import ICAL from "ical.js";
import { resolveCourseAlias } from "@/constants/CourseAliases";

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

const CALENDAR_TIMEZONE = "Europe/Berlin";
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const BERLIN_YMD_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: CALENDAR_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const BERLIN_OFFSET_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: CALENDAR_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

function utcDayKeyFromYmd(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function addDaysToYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function getBerlinOffsetMinutes(date: Date): number {
  const parts = BERLIN_OFFSET_FORMATTER.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
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

/**
 * Generates the iCal URL for a given course.
 * Applies alias resolution and normalizes to lowercase for the mailbox name.
 */
function generateIcalUrl(course: string): string {
  // Resolve alias and ensure lowercase to match OWA mailbox naming
  const canonical = resolveCourseAlias(course).toLowerCase();
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${canonical}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

/**
 * Validates if a course exists by checking if the iCal URL is accessible.
 */
export async function validateCourse(course: string): Promise<boolean> {
  if (!course || course.trim() === "") {
    return false;
  }

  try {
    const icalUrl = generateIcalUrl(course.trim());
    const response = await fetch(icalUrl, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.warn("Course validation failed:", error);
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
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Mapping of common Windows time zone IDs (as emitted by MS Exchange) to IANA TZIDs.
 * We only map those that we expect from DHBW calendars. Extend as needed.
 */
const WINDOWS_TO_IANA_TZID: Record<string, string> = {
  // Germany/Switzerland/Austria
  "W. Europe Standard Time": "Europe/Berlin",
  "Central European Standard Time": "Europe/Warsaw", // fallback; not expected for DHBW
};

/**
 * Minimal but robust VTIMEZONE component for Europe/Berlin covering DST rules since 1970.
 * Injected when no compatible VTIMEZONE exists and events reference Europe/Berlin.
 */
const EUROPE_BERLIN_VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "X-LIC-LOCATION:Europe/Berlin",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\n");

/**
 * Normalizes Windows TZIDs to IANA and ensures a suitable VTIMEZONE is available.
 * This helps ical.js to compute correct offsets for DTSTART/DTEND/EXDATE, even when
 * Exchange uses Windows TZIDs that are not known to iCal.js by default.
 */
function normalizeTimezones(icalText: string): string {
  let normalized = icalText;

  // Replace TZID parameters and values used by event properties (DTSTART;TZID=..., EXDATE;TZID=...)
  for (const [winTz, ianaTz] of Object.entries(WINDOWS_TO_IANA_TZID)) {
    // Parameter form: TZID=W. Europe Standard Time
    const paramRe = new RegExp(
      `(TZID=)${winTz.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[;:])`,
      "g",
    );
    normalized = normalized.replace(paramRe, `$1${ianaTz}`);

    // Property form inside VTIMEZONE: TZID:W. Europe Standard Time
    const propRe = new RegExp(
      `(TZID:)${winTz.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\r?\n)`,
      "g",
    );
    normalized = normalized.replace(propRe, `$1${ianaTz}`);
  }

  // If events now reference Europe/Berlin but no such VTIMEZONE exists, inject one.
  const referencesBerlin = /TZID=Europe\/Berlin|TZID:Europe\/Berlin/.test(
    normalized,
  );
  const hasBerlinVTimezone =
    /BEGIN:VTIMEZONE[\s\S]*?TZID:Europe\/Berlin[\s\S]*?END:VTIMEZONE/.test(
      normalized,
    );
  if (referencesBerlin && !hasBerlinVTimezone) {
    // Insert after BEGIN:VCALENDAR to keep calendar valid.
    normalized = normalized.replace(
      /BEGIN:VCALENDAR\r?\n/,
      (match) => `${match}${EUROPE_BERLIN_VTIMEZONE}\n`,
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
  const tzComps = vcalendar.getAllSubcomponents("vtimezone");
  if (!tzComps || tzComps.length === 0) return;

  tzComps.forEach((timezoneComp) => {
    const tzid = timezoneComp.getFirstPropertyValue("tzid");
    if (!tzid) return;
    try {
      const timezone = new (ICAL as any).Timezone({
        component: timezoneComp,
        tzid,
      });
      (ICAL as any).TimezoneService.register(tzid, timezone);
    } catch (e) {
      // If registration fails, ignore and continue with others
      console.warn("Failed to register VTIMEZONE for tzid", tzid, e);
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
  vevents: ICAL.Component[],
): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {};

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);
    if (event.isRecurrenceException()) {
      if (!result[event.uid]) result[event.uid] = new Set<string>();
      result[event.uid].add(event.recurrenceId.toJSDate().toDateString());
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

  const vevents = vcalendar.getAllSubcomponents("vevent");
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
        if (recurrenceExceptions[event.uid]?.has(nextDate.toDateString())) {
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
          location: occurrence.item.location || "",
          description: occurrence.item.description || undefined,
          allDay: !!occStart.isDate,
        });
      }
      return; // ✅ done with recurring master; skip normal processing.
    }

    // 2️⃣ Multi‑day single events → split into one per calendar day with proper day slices
    if (event.duration && event.duration.days >= 1) {
      const jsStart = event.startDate.toJSDate();
      const jsEnd = event.endDate.toJSDate();

      // Adjust end by -1ms to include exact-midnight endings into previous day
      const endAdj = new Date(jsEnd.getTime() - 1);
      const startKey = BERLIN_YMD_FORMATTER.format(jsStart);
      const endKey = BERLIN_YMD_FORMATTER.format(endAdj);

      // Number of calendar days spanned between start midnight and (end - 1ms) midnight.
      // Use UTC day keys to avoid DST-related 23/25h day lengths skewing the calculation.
      // 0 means: only one calendar day → exactly 1 slice.
      const totalDays = Math.floor(
        (utcDayKeyFromYmd(endKey) - utcDayKeyFromYmd(startKey)) / MS_IN_DAY,
      );

      // Important: do not use event.duration.days here (for all-day events, DTEND is exclusive).
      // Otherwise, a single-day holiday would be incorrectly split into two days.
      const daysToSplit = Math.max(0, totalDays);

      const isAllDayEvent = !!event.startDate.isDate;

      for (let offset = 0; offset <= daysToSplit; offset += 1) {
        const dayKey = addDaysToYmd(startKey, offset);
        // Day window: [sliceDayStart, sliceDayEnd)
        const sliceDayStart = berlinMidnight(dayKey);
        const sliceDayEnd = berlinMidnight(addDaysToYmd(dayKey, 1));

        const isFirst = offset === 0;
        const isLast = offset === daysToSplit;

        // Build start/end for this slice
        const sliceStart = isAllDayEvent
          ? sliceDayStart
          : isFirst
            ? jsStart
            : sliceDayStart;

        const sliceEnd = isAllDayEvent
          ? sliceDayEnd
          : isLast
            ? jsEnd
            : sliceDayEnd;

        // Per-slice allDay:
        // - Keep true for DATE-based (all-day) events
        // - Or mark as allDay when this slice cleanly spans one full calendar day
        //   (00:00 → next 00:00), inklusive 23/25h wegen DST.
        const isFullDayAligned =
          sliceStart.getTime() === sliceDayStart.getTime() &&
          sliceEnd.getTime() === sliceDayEnd.getTime();
        const sliceAllDay = isAllDayEvent || isFullDayAligned;

        allEvents.push({
          uid: `${event.uid}-${offset}`,
          title: event.summary,
          start: sliceStart,
          end: sliceEnd,
          location: event.location || "",
          description: event.description || undefined,
          allDay: sliceAllDay,
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
      location: event.location || "",
      description: event.description || undefined,
      allDay: !!event.startDate.isDate,
    });
  });

  return allEvents;
}

/**
 * Groups events by calendar day in chronological order.
 */
function structureEventsByDay(events: TimetableEvent[]): StructuredTimetable {
  const structured: StructuredTimetable = {};

  // Chronological order makes UI rendering trivial
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  events.forEach((event) => {
    const dateKey = BERLIN_YMD_FORMATTER.format(event.start); // → YYYY‑MM‑DD in Europe/Berlin
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
): Promise<StructuredTimetable> {
  if (!course || course.trim() === "") {
    throw new Error("Kurs muss angegeben werden");
  }

  const raw = await fetchRawIcalData(course.trim());
  const flatEvents = parseAndTransformIcal(raw);
  return structureEventsByDay(flatEvents);
}

// Test helper: parse raw ICS to flat events (used by local verification script)
export function __parseIcalForTest(icalText: string): TimetableEvent[] {
  return parseAndTransformIcal(icalText);
}
