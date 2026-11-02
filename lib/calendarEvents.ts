import type { StructuredTimetable } from '@/lib/icalService';
import { toLocalISOString } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  // All-day events use date-only values: Calendar Kit ignores the allDay flag
  // and only treats dateTime ranges of at least 24 hours as all-day, which
  // the 23-hour day at the start of daylight saving time is not
  start: { dateTime: string } | { date: string };
  end: { dateTime: string } | { date: string };
  location?: string;
  description?: string;
  allDay?: boolean;
  // Calendar Kit supports per-event styling; use this to color All‑Day chips
  color?: string;
  titleColor?: string;
}

/**
 * Maps the structured timetable to Calendar Kit events. Each all-day event is
 * a single Berlin calendar day, keyed by its day in the timetable.
 */
export function toCalendarEvents(
  data: StructuredTimetable,
  allDayColor: string
): CalendarEvent[] {
  const allEvents: CalendarEvent[] = [];

  Object.keys(data).forEach((dateKey) => {
    data[dateKey].forEach((event) => {
      const isAllDay = !!event.allDay;

      allEvents.push({
        id: event.uid,
        title: event.title,
        start: isAllDay
          ? { date: dateKey }
          : { dateTime: toLocalISOString(event.start) },
        end: isAllDay
          ? { date: dateKey }
          : { dateTime: toLocalISOString(event.end) },
        location: event.location,
        description: event.description,
        allDay: isAllDay,
        // Ensure All‑Day events (chips) adopt our brand tint color
        color: allDayColor,
        // Keep white titles only for All‑Day chips
        titleColor: isAllDay ? '#fff' : undefined,
      });
    });
  });

  return allEvents;
}
