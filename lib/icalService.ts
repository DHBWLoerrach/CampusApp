import ICAL from 'ical.js';

// --- Type Definitions ---

// Defines the structure of a single parsed event.
export interface TimetableEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
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
 * Registers the first VTIMEZONE found in the calendar with the ICAL TimezoneService.
 * MS Exchange calendars almost always include exactly one VTIMEZONE component.
 * Doing this once up‑front ensures that all date conversions are interpreted in
 * the calendar's native timezone instead of defaulting to local/UTC.
 */
function registerTimezone(vcalendar: ICAL.Component): void {
  const timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
  if (!timezoneComp) return;

  const tzid = timezoneComp.getFirstPropertyValue('tzid');
  if (!tzid) return;

  const timezone = new (ICAL as any).Timezone({
    component: timezoneComp,
    tzid,
  });
  (ICAL as any).TimezoneService.register(tzid, timezone);
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
  const jcalData = ICAL.parse(icalText);
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
      const iterator = event.iterator(ICAL.Time.fromJSDate(now));
      let next: ICAL.Time | null;

      // eslint‑disable‑next‑line no‑cond‑assign
      while (
        (next = iterator.next()) &&
        next &&
        next.toJSDate() < rangeEnd
      ) {
        // Skip buggy Exchange duplicates – the real exception VEVENT will follow.
        if (
          recurrenceExceptions[event.uid]?.has(
            next.toJSDate().toDateString()
          )
        ) {
          continue;
        }

        const occurrence = event.getOccurrenceDetails(next);
        allEvents.push({
          uid: `${event.uid}-${next.toString()}`,
          title: occurrence.item.summary,
          start: occurrence.startDate.toJSDate(),
          end: occurrence.endDate.toJSDate(),
          location: occurrence.item.location || '',
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

  events.forEach((event) => {
    const dateKey = event.start.toLocaleDateString('en-CA'); // → YYYY‑MM‑DD
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
