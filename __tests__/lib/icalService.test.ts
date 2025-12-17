import { __parseIcalForTest } from '@/lib/icalService';

function berlinYmd(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function berlinTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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

  it('splits timed event spanning multiple days (13:00 to 17:00 two days later)', () => {
    // Event starts on 2025-02-10 at 13:00 and ends on 2025-02-12 at 17:00 (Berlin time)
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VEVENT',
      'UID:multi-day-timed',
      'SUMMARY:Long Workshop',
      'DTSTART;TZID=W. Europe Standard Time:20250210T130000',
      'DTEND;TZID=W. Europe Standard Time:20250212T170000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const events = __parseIcalForTest(ics);

    // Should split into 3 events
    expect(events).toHaveLength(3);

    // Event 1: 2025-02-10, allDay false, 13:00-24:00 Berlin time
    expect(berlinYmd(events[0].start)).toBe('2025-02-10');
    expect(events[0].allDay).toBe(false);
    expect(berlinTime(events[0].start)).toBe('13:00');
    expect(berlinTime(events[0].end)).toBe('00:00');
    expect(berlinYmd(events[0].end)).toBe('2025-02-11');

    // Event 2: 2025-02-11, allDay true
    expect(berlinYmd(events[1].start)).toBe('2025-02-11');
    expect(events[1].allDay).toBe(true);

    // Event 3: 2025-02-12, allDay false, 00:00-17:00 Berlin time
    expect(berlinYmd(events[2].start)).toBe('2025-02-12');
    expect(events[2].allDay).toBe(false);
    expect(berlinTime(events[2].start)).toBe('00:00');
    expect(berlinTime(events[2].end)).toBe('17:00');
  });
});
