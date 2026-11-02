import { __parseIcalForTest } from '@/lib/icalService';

// Runs in the host timezone with `npm run test`; icalService.timezones.test.ts
// runs it again in separate processes with other device timezones.

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

// Excerpts from the production feeds (WWI24A, WDS25A, TIF24A). Exchange writes
// all-day DTEND inclusively: single-day events carry DTEND = DTSTART.
function allDayIcs(
  summary: string,
  dtstart: string,
  dtend?: string,
  extraLines: string[] = []
): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusApp Test//EN',
    'BEGIN:VEVENT',
    `UID:${summary}`,
    `SUMMARY:${summary}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    ...(dtend ? [`DTEND;VALUE=DATE:${dtend}`] : []),
    ...extraLines,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
}

describe(`icalService all-day events (device timezone ${
  Intl.DateTimeFormat().resolvedOptions().timeZone
})`, () => {
  it('runs in the requested device timezone', () => {
    const requested = process.env.TZ;
    if (!requested) return;

    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(resolved === 'Etc/UTC' ? 'UTC' : resolved).toBe(requested);
  });

  it.each([
    ['Karfreitag', '20270326', '20270326', ['2027-03-26']],
    [
      'OSTERN',
      '20270326',
      '20270329',
      ['2027-03-26', '2027-03-27', '2027-03-28', '2027-03-29'],
    ],
    [
      'Klausurphase',
      '20261214',
      '20261218',
      ['2026-12-14', '2026-12-15', '2026-12-16', '2026-12-17', '2026-12-18'],
    ],
    [
      'SILVESTER/ NEUJAHR',
      '20261231',
      '20270101',
      ['2026-12-31', '2027-01-01'],
    ],
  ])(
    'places %s (%s to %s) on the Berlin days of the feed',
    (summary, dtstart, dtend, expectedDays) => {
      const events = __parseIcalForTest(allDayIcs(summary, dtstart, dtend));

      expect(events.map((e) => berlinYmd(e.start))).toEqual(expectedDays);
      expect(events.every((e) => e.allDay)).toBe(true);
      // Each slice spans exactly one Berlin day: midnight to midnight
      for (const event of events) {
        expect(berlinTime(event.start)).toBe('00:00');
        expect(berlinTime(event.end)).toBe('00:00');
        expect(berlinYmd(new Date(event.end.getTime() - 1))).toBe(
          berlinYmd(event.start)
        );
      }
    }
  );

  it('treats an all-day event without DTEND as a single day', () => {
    const events = __parseIcalForTest(allDayIcs('Brückentag', '20261019'));

    expect(events.map((e) => berlinYmd(e.start))).toEqual(['2026-10-19']);
  });

  it('splits recurring all-day events into Berlin days across DST', () => {
    // Recurrences are expanded relative to now
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      const events = __parseIcalForTest(
        allDayIcs('Serie', '20270327', '20270329', [
          'RRULE:FREQ=YEARLY;COUNT=1',
        ])
      );

      expect(events.map((e) => berlinYmd(e.start))).toEqual([
        '2027-03-27',
        '2027-03-28',
        '2027-03-29',
      ]);
      expect(events.every((e) => e.allDay)).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
