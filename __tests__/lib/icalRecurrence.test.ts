import ICAL from 'ical.js';
import { visitOccurrences } from '@/lib/icalRecurrence';
import { parseIcal } from '@/lib/icalParser';

it('keeps a rescheduled occurrence from a series with a four-digit year padded with zeros', () => {
  const source = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:old-series',
    'DTSTART;VALUE=DATE:00010101',
    'RRULE:FREQ=YEARLY;COUNT=2',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:old-series',
    'RECURRENCE-ID;VALUE=DATE:00010101',
    'DTSTART;VALUE=DATE:20261103',
    'SUMMARY:Rescheduled',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  const { events, incomplete } = parseIcal(
    source,
    new Date('2026-11-02T08:00:00Z')
  );
  expect(incomplete).toBe(false);
  expect(events.map((event) => event.title)).toEqual(['Rescheduled']);
});

it('skips events without DTSTART and retains valid events', () => {
  const source = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:missing-both',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:missing-start',
    'DTEND:20261103T100000Z',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:lecture',
    'DTSTART:20261103T090000Z',
    'SUMMARY:Vorlesung',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  const { events } = parseIcal(source, new Date('2026-11-02T08:00:00Z'));
  expect(events.map((event) => event.title)).toEqual(['Vorlesung']);
});

it.each([
  'FREQ=DAILY;INTERVAL=3;COUNT=180',
  'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=65',
  'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=320',
])('preserves the ical.js recurrence dates for %s', (rule) => {
  const source = [
    'BEGIN:VEVENT',
    'UID:seminar',
    'DTSTART:20250106T090000Z',
    'DURATION:PT1H',
    'RRULE:' + rule,
    'RDATE:20260103T140000Z',
    'EXDATE:20260105T090000Z',
    'END:VEVENT',
  ].join('\n');
  const from = new Date('2026-01-01T00:00:00Z');
  const until = new Date('2026-12-31T23:59:59Z');
  const reference = new ICAL.Event(
    ICAL.Component.fromString(source)
  ).iterator();
  const expected: string[] = [];
  for (let time = reference.next(); time; time = reference.next()) {
    const instant = time.toJSDate();
    if (instant > until) break;
    if (instant >= from) expected.push(time.toString());
  }
  const actual: string[] = [];
  const complete = visitOccurrences(
    [ICAL.Component.fromString(source)],
    from,
    until,
    (occurrence) => {
      actual.push(occurrence.start.toString());
      return true;
    }
  );
  expect(complete).toBe(true);
  expect(actual).toEqual(expected);
});
