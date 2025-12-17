import { __parseIcalForTest } from '@/lib/icalService';

function berlinYmd(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

describe('icalService (DST + multi-day)', () => {
  it('splits all-day events across DST boundaries into correct calendar days', () => {
    // Europe/Berlin switches to DST on 2025-03-30. The gap makes the difference between
    // consecutive local midnights 23 hours, which must not reduce the day count.
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VEVENT',
      'UID:dst-all-day',
      'SUMMARY:DST Test',
      'DTSTART;VALUE=DATE:20250330',
      'DTEND;VALUE=DATE:20250401',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const events = __parseIcalForTest(ics);
    expect(events).toHaveLength(2);
    expect(events.map((e) => berlinYmd(e.start))).toEqual([
      '2025-03-30',
      '2025-03-31',
    ]);
    expect(events.every((e) => e.allDay)).toBe(true);
  });
});
