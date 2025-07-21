import ICAL from 'ical.js';

const course = 'tif24a';
const ICAL_URL = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;

// --- Type Definitions ---

// Defines the structure of a single parsed event.
export interface TimetableEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
}

// Defines the final data structure for the UI: a key-value map
// where the key is a date string ('YYYY-MM-DD') and the value is an array of events.
export interface StructuredTimetable {
  [dateKey: string]: TimetableEvent[];
}

/**
 * Fetches the raw iCal data from the specified URL.
 * @returns {Promise<string>} The raw iCal data as a string.
 */
async function fetchRawIcalData(): Promise<string> {
  try {
    const response = await fetch(ICAL_URL);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.statusText}`
      );
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching iCal data:', error);
    throw error; // Re-throw the error for React Query to handle.
  }
}

/**
 * Parses the iCal text, expands recurring events, and transforms them into a clean array.
 * @param {string} icalText - The raw iCal data.
 * @returns {TimetableEvent[]} An array of all timetable events.
 */
function parseAndTransformIcal(icalText: string): TimetableEvent[] {
  const jcalData = ICAL.parse(icalText);
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const allEvents: TimetableEvent[] = [];
  const now = new Date();
  // We expand recurring events for the next year from today.
  const endDateForRecurrence = new Date();
  endDateForRecurrence.setFullYear(now.getFullYear() + 1);

  vevents.forEach((vevent: any) => {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iterator = event.iterator(ICAL.Time.fromJSDate(now));
      let next;
      while (
        (next = iterator.next()) &&
        next.toJSDate() < endDateForRecurrence
      ) {
        const occurrence = event.getOccurrenceDetails(next);
        allEvents.push({
          uid: `${event.uid}-${next.toString()}`, // Create a unique ID for the occurrence
          title: occurrence.item.summary,
          start: occurrence.startDate.toJSDate(),
          end: occurrence.endDate.toJSDate(),
          location: occurrence.item.location,
        });
      }
    } else {
      allEvents.push({
        uid: event.uid,
        title: event.summary,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        location: event.location || '',
      });
    }
  });

  return allEvents;
}

/**
 * Structures a flat array of events into an object grouped by day.
 * @param {TimetableEvent[]} events - The flat array of events.
 * @returns {StructuredTimetable} The events grouped by date string ('YYYY-MM-DD').
 */
function structureEventsByDay(
  events: TimetableEvent[]
): StructuredTimetable {
  const structuredData: StructuredTimetable = {};

  // Sort events by start time first for a chronological list each day.
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  events.forEach((event) => {
    // 'en-CA' reliably provides the 'YYYY-MM-DD' format.
    const dateKey = event.start.toLocaleDateString('en-CA');

    if (!structuredData[dateKey]) {
      structuredData[dateKey] = [];
    }
    structuredData[dateKey].push(event);
  });

  return structuredData;
}

/**
 * The main orchestrator function. Fetches, parses, and structures the timetable data.
 * This is the function that our React Hook will call.
 * @returns {Promise<StructuredTimetable>} The fully processed and structured timetable data.
 */
export async function getStructuredTimetable(): Promise<StructuredTimetable> {
  const rawData = await fetchRawIcalData();
  const allEvents = parseAndTransformIcal(rawData);
  const structuredData = structureEventsByDay(allEvents);
  return structuredData;
}
