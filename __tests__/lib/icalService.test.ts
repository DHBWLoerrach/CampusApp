import ICAL from 'ical.js';
import {
  __parseIcalForTest,
  CalendarError,
  CalendarErrorCode,
  getStructuredTimetable,
  validateCourse,
} from '@/lib/icalService';
import {
  resolveCourseAlias,
  unresolveCourseAlias,
} from '@/constants/CourseAliases';

afterEach(() => {
  jest.restoreAllMocks();
});

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

describe('icalService network errors', () => {
  it('includes the HTTP status when the calendar response has no status text', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: '',
    } as Response);

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Http,
      status: 500,
    });
  });

  it('preserves the cause of fetch failures', async () => {
    const cause = new Error('Network failed');
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValue(cause);

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Network,
      cause,
    });
  });

  it('does not map aborted requests to calendar network errors', async () => {
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError',
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValue(abortError);

    await expect(getStructuredTimetable('TIF25A')).rejects.toBe(abortError);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('maps failures while reading the response body to a network error', async () => {
    const cause = new Error('Body stream interrupted');
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: jest.fn().mockRejectedValue(cause),
    } as unknown as Response);

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Network,
      cause,
    });
  });

  it('preserves the cause of calendar parsing failures', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('not an ical document'),
    } as unknown as Response);

    await expect(getStructuredTimetable('TIF25A')).rejects.toEqual(
      expect.objectContaining<Partial<CalendarError>>({
        code: CalendarErrorCode.Parse,
        cause: expect.anything(),
      })
    );
  });
});

describe('icalService (DST + multi-day)', () => {
  it('splits all-day events across DST boundaries into correct calendar days', () => {
    // Europe/Berlin switches to DST on 2025-03-30. The gap makes the difference between
    // consecutive local midnights 23 hours, which must not reduce the day count.
    // DTEND is inclusive in the DHBW feed, so the event covers three days.
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
    expect(events).toHaveLength(3);
    expect(events.map((e) => berlinYmd(e.start))).toEqual([
      '2025-03-30',
      '2025-03-31',
      '2025-04-01',
    ]);
    expect(events.every((e) => e.allDay)).toBe(true);
    // The DST day is 23 hours long
    expect(events[0].end.getTime() - events[0].start.getTime()).toBe(
      23 * 60 * 60 * 1000
    );
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

describe('icalService description sanitizing', () => {
  function parseDescription(rawDescription: string): string | undefined {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VEVENT',
      'UID:description-test',
      'SUMMARY:Lecture',
      'DTSTART;TZID=W. Europe Standard Time:20250210T130000',
      'DTEND;TZID=W. Europe Standard Time:20250210T170000',
      `DESCRIPTION:${rawDescription}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    return __parseIcalForTest(ics)[0].description;
  }

  it('drops leftover conditional comment markers from Outlook exports', () => {
    expect(
      parseDescription(
        '\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n<![endif]-->\\n\\n\\n\\nDeadline 16.08.\\n\\n\\n\\n'
      )
    ).toBe('Deadline 16.08.');
  });

  it('drops descriptions that only carry markup and whitespace', () => {
    expect(
      parseDescription(
        '\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n<![endif]-->\\n\\n\\n\\n \\n\\n\\n\\n'
      )
    ).toBeUndefined();
  });

  it('drops complete HTML comments including their content', () => {
    expect(
      parseDescription(
        '<!--[if gte mso 9]><xml>junk</xml><![endif]-->Raum A261'
      )
    ).toBe('Raum A261');
  });

  it('keeps multi-line content intact', () => {
    expect(
      parseDescription(
        '\\n<![endif]-->\\n\\nAchtung: Beginn 13 Uhr\\nRaum A261\\n\\n'
      )
    ).toBe('Achtung: Beginn 13 Uhr\nRaum A261');
  });

  it('leaves descriptions without markup untouched', () => {
    expect(parseDescription('Link im Moodle-Raum von Hrn. Bernecker')).toBe(
      'Link im Moodle-Raum von Hrn. Bernecker'
    );
  });

  it('strips nested HTML comment fragments cleanly', () => {
    expect(parseDescription('<!<!-- -->-- hidden -->Raum B101')).toBe(
      'Raum B101'
    );
  });

  it('handles repeated unclosed comment markers in linear time', () => {
    const adversarial = `${'<!--'.repeat(2000)}${'<![if '.repeat(2000)}Text`;
    const startedAt = Date.now();
    const result = parseDescription(adversarial);
    expect(Date.now() - startedAt).toBeLessThan(500);
    expect(result).toContain('Text');
  });
});

describe('icalService security hardening', () => {
  it.each([
    '../other',
    'a..b',
    '.tif25a',
    'tif25a.',
    'tif25a/../../owa',
    'tif25a#fragment',
    'tif25a?foo=bar',
    'tif25a@evil.example',
    'tif 25a',
    'a'.repeat(65),
    '-leading-dash',
  ])(
    'rejects invalid course "%s" without sending a network request',
    async (badCourse) => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      await expect(validateCourse(badCourse)).resolves.toBe(false);
      await expect(getStructuredTimetable(badCourse)).rejects.toMatchObject({
        code: CalendarErrorCode.InvalidCourse,
      });
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  );

  it('accepts valid mailbox characters including single dot and plus during course validation', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
    } as unknown as Response);

    await expect(validateCourse('WWI25A')).resolves.toBe(true);
    await expect(validateCourse('st.25a+1')).resolves.toBe(true);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      'https://webmail.dhbw-loerrach.de/owa/calendar/kal-wwi25a-am@dhbw-loerrach.de/Kalender/calendar.ics',
      expect.objectContaining({ method: 'HEAD' })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      'https://webmail.dhbw-loerrach.de/owa/calendar/kal-st.25a%2B1@dhbw-loerrach.de/Kalender/calendar.ics',
      expect.objectContaining({ method: 'HEAD' })
    );
  });

  it('handles Object.prototype property names safely in alias resolution', () => {
    expect(resolveCourseAlias('constructor')).toBe('constructor');
    expect(resolveCourseAlias('toString')).toBe('tostring');
    expect(unresolveCourseAlias('constructor')).toBe('constructor');
    expect(unresolveCourseAlias('valueOf')).toBe('valueof');
  });

  it('rejects oversized calendar responses based on Content-Length', async () => {
    const cancel = jest.fn().mockResolvedValue(undefined);
    let capturedSignal: AbortSignal | undefined;
    jest.spyOn(global, 'fetch').mockImplementation(async (_url, init) => {
      capturedSignal = init?.signal ?? undefined;
      return {
        ok: true,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === 'content-length' ? String(20_000_000) : null,
        },
        body: { cancel },
        text: jest.fn(),
      } as unknown as Response;
    });

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Parse,
    });
    expect(capturedSignal?.aborted).toBe(true);
    expect(cancel).toHaveBeenCalled();
  });

  it('aborts streaming downloads as soon as the byte limit is exceeded', async () => {
    let chunksRead = 0;
    let canceled = false;
    let capturedSignal: AbortSignal | undefined;
    const chunk = new Uint8Array(3 * 1024 * 1024); // 3 MiB per chunk

    jest.spyOn(global, 'fetch').mockImplementation(async (_url, init) => {
      capturedSignal = init?.signal ?? undefined;
      const body = new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            chunksRead += 1;
            controller.enqueue(chunk);
          },
          cancel() {
            canceled = true;
          },
        },
        { highWaterMark: 0 }
      );
      return {
        ok: true,
        headers: { get: () => null },
        body,
      } as unknown as Response;
    });

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Parse,
    });
    expect(chunksRead).toBe(6);
    expect(capturedSignal?.aborted).toBe(true);
    expect(canceled).toBe(true);
  });

  it('counts UTF-8 bytes rather than UTF-16 code units when no stream is available', async () => {
    // 6,000,000 '€' chars = 6,000,000 UTF-16 code units (< 15 MiB), but 18,000,000 UTF-8 bytes (> 15 MiB)
    const multiByteBody = '€'.repeat(6_000_000);
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      text: jest.fn().mockResolvedValue(multiByteBody),
    } as unknown as Response);

    await expect(getStructuredTimetable('TIF25A')).rejects.toMatchObject({
      code: CalendarErrorCode.Parse,
    });
  });

  it('handles recurrence exceptions with Object.prototype UIDs safely', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:constructor',
        'SUMMARY:Original',
        'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
        'DTEND;TZID=W. Europe Standard Time:20261103T100000',
        'RRULE:FREQ=WEEKLY;COUNT=2',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:constructor',
        'RECURRENCE-ID;VALUE=DATE:20261110',
        'SUMMARY:Modified',
        'DTSTART;TZID=W. Europe Standard Time:20261110T110000',
        'DTEND;TZID=W. Europe Standard Time:20261110T120000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      expect(events).toHaveLength(2);
      expect(
        events
          .slice()
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .map((e) => e.title)
      ).toEqual(['Original', 'Modified']);
    } finally {
      jest.useRealTimers();
    }
  });

  it('caps extreme recurrence expansions and clips multi-year spans to the visible window', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:huge-recurrence',
        'SUMMARY:Secondly',
        'DTSTART:20261103T090000Z',
        'DTEND:20261103T090001Z',
        'RRULE:FREQ=SECONDLY',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:huge-allday',
        'SUMMARY:Century',
        'DTSTART;VALUE=DATE:20260101',
        'DTEND;VALUE=DATE:21260101',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:huge-timed',
        'SUMMARY:Century Timed',
        'DTSTART;TZID=W. Europe Standard Time:20260101T080000',
        'DTEND;TZID=W. Europe Standard Time:21260101T180000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const startedAt = Date.now();
      const events = __parseIcalForTest(ics);
      expect(Date.now() - startedAt).toBeLessThan(2000);

      const allDaySliced = events.filter((e) =>
        e.uid.startsWith('huge-allday-')
      );
      expect(allDaySliced).toHaveLength(373);
      expect(berlinYmd(allDaySliced[0].start)).toBe('2026-10-26');
      expect(berlinYmd(allDaySliced[allDaySliced.length - 1].start)).toBe(
        '2027-11-02'
      );

      const timedSlices = events.filter((e) => e.uid.startsWith('huge-timed-'));
      expect(timedSlices).toHaveLength(373);
      const lastSlice = timedSlices[timedSlices.length - 1];
      expect(berlinYmd(lastSlice.start)).toBe('2027-11-02');
      expect(berlinYmd(new Date(lastSlice.end.getTime() - 1))).toBe(
        '2027-11-02'
      );
      expect(berlinTime(lastSlice.end)).toBe('00:00');
      expect(lastSlice.allDay).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps current and upcoming days for multi-year study periods starting over a year ago', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:study-period-allday',
        'SUMMARY:Praxisphase',
        'DTSTART;VALUE=DATE:20251001',
        'DTEND;VALUE=DATE:20270930',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:study-period-timed',
        'SUMMARY:Projektzeitraum',
        'DTSTART;TZID=W. Europe Standard Time:20251001T080000',
        'DTEND;TZID=W. Europe Standard Time:20270930T170000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      const allDayDays = events
        .filter((e) => e.uid.startsWith('study-period-allday-'))
        .map((e) => berlinYmd(e.start));
      expect(allDayDays[0]).toBe('2026-10-26');
      expect(allDayDays).toContain('2026-11-02');
      expect(allDayDays[allDayDays.length - 1]).toBe('2027-09-30');

      const timedSlices = events.filter((e) =>
        e.uid.startsWith('study-period-timed-')
      );
      expect(berlinYmd(timedSlices[0].start)).toBe('2026-10-26');
      expect(timedSlices.some((e) => berlinYmd(e.start) === '2026-11-02')).toBe(
        true
      );
      const finalTimedSlice = timedSlices[timedSlices.length - 1];
      expect(berlinYmd(finalTimedSlice.start)).toBe('2027-09-30');
      expect(berlinTime(finalTimedSlice.end)).toBe('17:00');
      expect(finalTimedSlice.allDay).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not let historical events at the start of the feed crowd out current lectures and logs a warning', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // 30 historical multi-day events * 380 days = 11,400 out-of-window slices before today's lecture
      const historicalEvents = Array.from({ length: 30 }, (_, i) =>
        [
          'BEGIN:VEVENT',
          `UID:hist-${i}`,
          `SUMMARY:Old ${i}`,
          'DTSTART;VALUE=DATE:20200101',
          'DTEND;VALUE=DATE:20220101',
          'END:VEVENT',
        ].join('\n')
      );
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        ...historicalEvents,
        'BEGIN:VEVENT',
        'UID:current-lecture',
        'SUMMARY:Algorithmen',
        'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
        'DTEND;TZID=W. Europe Standard Time:20261103T121500',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      expect(events.some((e) => e.title === 'Algorithmen')).toBe(true);
      expect(events.length).toBeLessThanOrEqual(10_000);
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('enforces a shared recurrence iteration budget lazily without initializing excess iterators', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const iteratorSpy = jest.spyOn(ICAL.Event.prototype, 'iterator');
    try {
      const historicalSeries = Array.from({ length: 40 }, (_, i) =>
        [
          'BEGIN:VEVENT',
          `UID:old-secondly-${i}`,
          `SUMMARY:Old ${i}`,
          'DTSTART:20200101T090000Z',
          'DTEND:20200101T090001Z',
          'RRULE:FREQ=SECONDLY',
          'END:VEVENT',
        ].join('\n')
      );
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        ...historicalSeries,
        'END:VCALENDAR',
      ].join('\n');

      const startedAt = Date.now();
      const events = __parseIcalForTest(ics);
      expect(Date.now() - startedAt).toBeLessThan(1000);
      expect(events).toHaveLength(0);
      // 20,000 shared budget / 5,000 per event = at most 4 iterators initialized, not 40
      expect(iteratorSpy.mock.calls.length).toBeLessThanOrEqual(5);
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('preserves valid old recurring series and their INTERVAL rhythm in the visible window', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:old-daily',
        'SUMMARY:Daily Standup',
        'DTSTART;TZID=W. Europe Standard Time:20101101T090000',
        'DTEND;TZID=W. Europe Standard Time:20101101T093000',
        'RRULE:FREQ=DAILY',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:old-interval-3',
        'SUMMARY:Every 3 Days',
        'DTSTART;TZID=W. Europe Standard Time:20101101T140000',
        'DTEND;TZID=W. Europe Standard Time:20101101T150000',
        'RRULE:FREQ=DAILY;INTERVAL=3',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:expired-series',
        'SUMMARY:Expired',
        'DTSTART;TZID=W. Europe Standard Time:20101101T100000',
        'DTEND;TZID=W. Europe Standard Time:20101101T110000',
        'RRULE:FREQ=DAILY;UNTIL=20200101T000000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      const dailyEvents = events.filter((e) => e.uid.startsWith('old-daily-'));
      // Window: 2026-10-26 09:00 Berlin .. 2027-11-02 09:00 Berlin = 373 days (or 372 depending on exact boundary)
      expect(dailyEvents.length).toBeGreaterThanOrEqual(372);
      expect(dailyEvents.every((e) => berlinTime(e.start) === '09:00')).toBe(
        true
      );

      // Verify INTERVAL=3 phase matches 2010-11-01 + 3*k days
      const intervalEvents = events.filter((e) =>
        e.uid.startsWith('old-interval-3-')
      );
      expect(intervalEvents.length).toBeGreaterThanOrEqual(120);
      const anchorUtc = Date.UTC(2010, 10, 1);
      for (const ev of intervalEvents) {
        const [y, m, d] = berlinYmd(ev.start).split('-').map(Number);
        const daysSinceAnchor = Math.round(
          (Date.UTC(y, m - 1, d) - anchorUtc) / (24 * 60 * 60 * 1000)
        );
        expect(daysSinceAnchor % 3).toBe(0);
        expect(berlinTime(ev.start)).toBe('14:00');
      }

      expect(
        events.filter((e) => e.uid.startsWith('expired-series-'))
      ).toHaveLength(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('splits and caps single DURATION:P...W and recurring multi-day timed events', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:weeks-duration',
        'SUMMARY:Two-Year Week Duration',
        'DTSTART;TZID=W. Europe Standard Time:20260101T090000',
        'DURATION:P104W',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:recurring-long-timed',
        'SUMMARY:Long Recurring Timed',
        'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
        'DURATION:P400D',
        'RRULE:FREQ=YEARLY;COUNT=1',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);

      const weekSlices = events.filter((e) =>
        e.uid.startsWith('weeks-duration-')
      );
      expect(weekSlices.length).toBeGreaterThan(1);
      expect(weekSlices.length).toBeLessThanOrEqual(380);
      for (const slice of weekSlices) {
        expect(berlinYmd(new Date(slice.end.getTime() - 1))).toBe(
          berlinYmd(slice.start)
        );
      }

      const recSlices = events.filter((e) =>
        e.uid.startsWith('recurring-long-timed-')
      );
      expect(recSlices.length).toBeGreaterThan(1);
      expect(recSlices.length).toBeLessThanOrEqual(380);
      for (const slice of recSlices) {
        expect(berlinYmd(new Date(slice.end.getTime() - 1))).toBe(
          berlinYmd(slice.start)
        );
      }
    } finally {
      jest.useRealTimers();
    }
  });

  it('prioritizes current recurring series ahead of historical series that exhaust the budget', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // 5 expired historical series with BYDAY+COUNT (cannot be arithmetically fast-forwarded)
      // totaling 5 * 4000 = 20,000 iterations before a current 3-lecture series.
      const historical = Array.from({ length: 5 }, (_, i) =>
        [
          'BEGIN:VEVENT',
          `UID:hist-byday-${i}`,
          `SUMMARY:Historical ${i}`,
          'DTSTART;TZID=W. Europe Standard Time:20050103T090000',
          'DTEND;TZID=W. Europe Standard Time:20050103T100000',
          'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=4000',
          'END:VEVENT',
        ].join('\n')
      );
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        ...historical,
        'BEGIN:VEVENT',
        'UID:current-series',
        'SUMMARY:Aktuelle Vorlesung',
        'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
        'DTEND;TZID=W. Europe Standard Time:20261103T103000',
        'RRULE:FREQ=WEEKLY;COUNT=3',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      const current = events.filter((e) => e.title === 'Aktuelle Vorlesung');
      expect(current).toHaveLength(3);
    } finally {
      jest.useRealTimers();
    }
  });

  it('preserves old COUNT series (with exact end) and RDATE additions when fast-forwarding', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      // 2010-11-01 to 2026-11-02 is 5845 days; COUNT=5850 means 5850th day is 2026-11-06
      // (indices 0..5849 -> last occurrence 2026-11-06).
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:old-count-long',
        'SUMMARY:Old Count Full Window',
        'DTSTART;TZID=W. Europe Standard Time:20101101T090000',
        'DTEND;TZID=W. Europe Standard Time:20101101T093000',
        'RRULE:FREQ=DAILY;COUNT=7000',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:old-count-ending',
        'SUMMARY:Old Count Ending In Window',
        'DTSTART;TZID=W. Europe Standard Time:20101101T100000',
        'DTEND;TZID=W. Europe Standard Time:20101101T103000',
        'RRULE:FREQ=DAILY;COUNT=5850',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:old-with-rdate',
        'SUMMARY:Old With RDATE',
        'DTSTART;TZID=W. Europe Standard Time:20101101T090000',
        'DTEND;TZID=W. Europe Standard Time:20101101T093000',
        'RRULE:FREQ=DAILY',
        'RDATE;TZID=W. Europe Standard Time:20120501T150000',
        'RDATE;TZID=W. Europe Standard Time:20261105T150000',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:expired-count-with-rdate',
        'SUMMARY:Expired Count Plus RDATE',
        'DTSTART;TZID=W. Europe Standard Time:20101101T120000',
        'DTEND;TZID=W. Europe Standard Time:20101101T123000',
        'RRULE:FREQ=DAILY;COUNT=100',
        'RDATE;TZID=W. Europe Standard Time:20261106T160000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);

      const fullCountEvents = events.filter((e) =>
        e.uid.startsWith('old-count-long-')
      );
      expect(fullCountEvents).toHaveLength(373);

      const endingCountEvents = events.filter((e) =>
        e.uid.startsWith('old-count-ending-')
      );
      // Window starts 2026-10-26 (day 5838); days 5838..5849 inclusive = 12 occurrences ending 2026-11-06
      expect(endingCountEvents.map((e) => berlinYmd(e.start))).toEqual([
        '2026-10-26',
        '2026-10-27',
        '2026-10-28',
        '2026-10-29',
        '2026-10-30',
        '2026-10-31',
        '2026-11-01',
        '2026-11-02',
        '2026-11-03',
        '2026-11-04',
        '2026-11-05',
        '2026-11-06',
      ]);

      const withRdateEvents = events.filter((e) =>
        e.uid.startsWith('old-with-rdate-')
      );
      expect(withRdateEvents).toHaveLength(374);
      expect(
        withRdateEvents.some(
          (e) =>
            berlinYmd(e.start) === '2026-11-05' &&
            berlinTime(e.start) === '15:00'
        )
      ).toBe(true);

      const expiredWithRdate = events.filter((e) =>
        e.uid.startsWith('expired-count-with-rdate-')
      );
      expect(expiredWithRdate).toHaveLength(1);
      expect(berlinYmd(expiredWithRdate[0].start)).toBe('2026-11-06');
      expect(berlinTime(expiredWithRdate[0].start)).toBe('16:00');
    } finally {
      jest.useRealTimers();
    }
  });

  it('skips slicing additional historical all-day events once the out-of-window budget is full', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const formatSpy = jest.spyOn(
      Intl.DateTimeFormat.prototype,
      'formatToParts'
    );
    try {
      const makeFeed = (count: number) =>
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//CampusApp Test//EN',
          ...Array.from({ length: count }, (_, i) =>
            [
              'BEGIN:VEVENT',
              `UID:hist-allday-${i}`,
              `SUMMARY:Old ${i}`,
              'DTSTART;VALUE=DATE:20200101',
              'DTEND;VALUE=DATE:20220101',
              'END:VEVENT',
            ].join('\n')
          ),
          'END:VCALENDAR',
        ].join('\n');

      formatSpy.mockClear();
      __parseIcalForTest(makeFeed(30));
      const callsFor30 = formatSpy.mock.calls.length;

      formatSpy.mockClear();
      __parseIcalForTest(makeFeed(60));
      const callsFor60 = formatSpy.mock.calls.length;

      expect(callsFor60).toBe(callsFor30);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps an ongoing semester BYDAY+COUNT series started in August behind expired historical series', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // 5 expired complex historical series (BYMONTHDAY+COUNT) burning the fallback budget
      const historical = Array.from({ length: 5 }, (_, i) =>
        [
          'BEGIN:VEVENT',
          `UID:hist-complex-${i}`,
          `SUMMARY:Expired Complex ${i}`,
          'DTSTART;TZID=W. Europe Standard Time:19900101T090000',
          'DTEND;TZID=W. Europe Standard Time:19900101T100000',
          'RRULE:FREQ=DAILY;BYMONTHDAY=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15;COUNT=4000',
          'END:VEVENT',
        ].join('\n')
      );
      // Active semester series starting Aug 3 (>60 days before Oct 26 windowStart)
      // MO,WE for 42 occurrences: 24 before Oct 26 + 18 in [Oct 26 .. Dec 23]
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        ...historical,
        'BEGIN:VEVENT',
        'UID:semester-byday',
        'SUMMARY:Mathematik II',
        'DTSTART;TZID=W. Europe Standard Time:20260803T090000',
        'DTEND;TZID=W. Europe Standard Time:20260803T103000',
        'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=42',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      const mathEvents = events.filter((e) => e.title === 'Mathematik II');
      expect(mathEvents).toHaveLength(18);
      expect(berlinYmd(mathEvents[0].start)).toBe('2026-10-26');
      expect(berlinYmd(mathEvents[mathEvents.length - 1].start)).toBe(
        '2026-12-23'
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('fast-forwards old ongoing DAILY BYDAY+COUNT weekday series without losing occurrences', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    try {
      // Starts Mon 2005-01-03 (5 weekdays/week). 2005-01-03..2027-11-02 is ~1191 weeks (~5957 weekdays).
      // COUNT=7000 covers the full visible window [2026-10-26 .. 2027-11-02] = 267 weekdays.
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        'BEGIN:VEVENT',
        'UID:old-weekdays',
        'SUMMARY:Werktags-Standup',
        'DTSTART;TZID=W. Europe Standard Time:20050103T090000',
        'DTEND;TZID=W. Europe Standard Time:20050103T091500',
        'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=7000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      expect(events).toHaveLength(267);
      expect(berlinYmd(events[0].start)).toBe('2026-10-26');
      expect(berlinYmd(events[events.length - 1].start)).toBe('2027-11-02');
      expect(events.every((e) => berlinTime(e.start) === '09:00')).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not let folded DESCRIPTION text spoof a VTIMEZONE block', () => {
    // Clear any cached Europe/Berlin timezone from earlier tests so the fallback
    // registration path is genuinely exercised.
    (ICAL as any).TimezoneService.reset();

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VEVENT',
      'UID:folded-spoof',
      'SUMMARY:Morning Lecture',
      'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
      'DTEND;TZID=W. Europe Standard Time:20261103T103000',
      'DESCRIPTION:Intro',
      ' BEGIN:VTIMEZONE',
      ' TZID:Europe/Berlin',
      ' END:VTIMEZONE',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const events = __parseIcalForTest(ics);
    expect(events).toHaveLength(1);
    // 2026-11-03 09:00 Europe/Berlin (CET = UTC+1) MUST equal 08:00:00Z, even on UTC machines
    expect(events[0].start.toISOString()).toBe('2026-11-03T08:00:00.000Z');
    expect(events[0].end.toISOString()).toBe('2026-11-03T09:30:00.000Z');
  });

  it('ignores malformed VTIMEZONE blocks without TZID and still applies the Berlin fallback', () => {
    (ICAL as any).TimezoneService.reset();

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VTIMEZONE',
      'X-BROKEN:missing-tzid',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:malformed-vtz',
      'SUMMARY:Morning Lecture',
      'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
      'DTEND;TZID=W. Europe Standard Time:20261103T103000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const events = __parseIcalForTest(ics);
    expect(events).toHaveLength(1);
    expect(events[0].start.toISOString()).toBe('2026-11-03T08:00:00.000Z');
  });

  it('preserves valid lowercase utc VTIMEZONE definitions across device timezones', () => {
    (ICAL as any).TimezoneService.reset();

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VTIMEZONE',
      'TZID:utc',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0000',
      'TZOFFSETTO:+0000',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:lowercase-utc',
      'SUMMARY:UTC Event',
      'DTSTART;TZID=utc:20261103T090000',
      'DTEND;TZID=utc:20261103T100000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const events = __parseIcalForTest(ics);
    expect(events).toHaveLength(1);
    expect(events[0].start.toISOString()).toBe('2026-11-03T09:00:00.000Z');
  });

  it('does not let old HOURLY series with future UNTIL starve upcoming lecture series', () => {
    jest.useFakeTimers({ now: new Date('2026-11-02T08:00:00Z') });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const oldHourly = Array.from({ length: 4 }, (_, i) =>
        [
          'BEGIN:VEVENT',
          `UID:old-hourly-${i}`,
          `SUMMARY:Old Hourly ${i}`,
          'DTSTART:20200101T090000Z',
          'DTEND:20200101T093000Z',
          'RRULE:FREQ=HOURLY;UNTIL=20270601T000000Z',
          'END:VEVENT',
        ].join('\n')
      );
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CampusApp Test//EN',
        ...oldHourly,
        'BEGIN:VEVENT',
        'UID:tomorrow-lecture',
        'SUMMARY:Datenbanken',
        'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
        'DTEND;TZID=W. Europe Standard Time:20261103T103000',
        'RRULE:FREQ=WEEKLY;COUNT=3',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n');

      const events = __parseIcalForTest(ics);
      expect(events.filter((e) => e.title === 'Datenbanken')).toHaveLength(3);
    } finally {
      jest.useRealTimers();
    }
  });

  it('checks VTIMEZONE presence in linear time without regex backtracking', () => {
    const repeated = 'BEGIN:VTIMEZONE\nTZID:Europe/Berlin\n'.repeat(1500);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusApp Test//EN',
      'BEGIN:VEVENT',
      'UID:redos-tz',
      'SUMMARY:Lecture',
      'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
      'DTEND;TZID=W. Europe Standard Time:20261103T100000',
      `DESCRIPTION:${repeated.replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const startedAt = Date.now();
    const events = __parseIcalForTest(ics);
    expect(Date.now() - startedAt).toBeLessThan(500);
    expect(events).toHaveLength(1);
  });
});
