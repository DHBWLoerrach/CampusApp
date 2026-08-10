import {
  inclusiveDayCount,
  msUntilBerlinMidnight,
  todayInBerlin,
  ymd,
} from '@/lib/berlinDate';

describe('todayInBerlin', () => {
  it('uses the Berlin calendar day regardless of the UTC instant', () => {
    // Summer (CEST, UTC+2): 22:30 UTC is already the next day in Berlin.
    expect(todayInBerlin(new Date('2027-06-30T22:30:00Z'))).toBe('2027-07-01');
    // Winter (CET, UTC+1): 23:30 UTC is already the next day in Berlin.
    expect(todayInBerlin(new Date('2027-01-31T23:30:00Z'))).toBe('2027-02-01');
    expect(todayInBerlin(new Date('2027-01-31T12:00:00Z'))).toBe('2027-01-31');
  });
});

describe('inclusiveDayCount', () => {
  it('counts both boundary days (inclusive end date)', () => {
    expect(inclusiveDayCount(ymd('2026-10-01'), ymd('2026-10-01'))).toBe(1);
    expect(inclusiveDayCount(ymd('2026-10-01'), ymd('2026-10-02'))).toBe(2);
  });
});

/** Berlin wall-clock rendering of an instant, e.g. "29/03/2027, 00:00:01". */
function berlinClock(at: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'short',
    timeStyle: 'medium',
    hour12: false,
  }).format(at);
}

describe('msUntilBerlinMidnight', () => {
  it('counts down to the Berlin day change, not the UTC one', () => {
    // 21:30 UTC in summer is 23:30 in Berlin: half an hour left, plus slack.
    expect(msUntilBerlinMidnight(new Date('2027-06-30T21:30:00Z'))).toBe(
      30 * 60 * 1000 + 1000
    );
  });

  it('accounts for the winter offset', () => {
    // 23:30 UTC in winter is 00:30 in Berlin: nearly a full day left.
    expect(msUntilBerlinMidnight(new Date('2027-01-31T23:30:00Z'))).toBe(
      (23 * 60 + 30) * 60 * 1000 + 1000
    );
  });

  it('never returns zero, so a timer built on it cannot spin', () => {
    expect(
      msUntilBerlinMidnight(new Date('2027-06-30T21:59:59Z'))
    ).toBeGreaterThan(0);
  });

  // The naive "24 hours minus elapsed wall time" is wrong on the switch days.
  // Landing an hour late there would leave the screen showing yesterday.
  it('hits midnight on the 23-hour day when DST starts', () => {
    // 2027-03-28 switches 02:00 -> 03:00. Berlin is at 00:30 here.
    const now = new Date('2027-03-27T23:30:00Z');

    // 2027-03-29 00:00 CEST is 2027-03-28 22:00 UTC — 22.5 hours away.
    expect(msUntilBerlinMidnight(now)).toBe(22.5 * 60 * 60 * 1000 + 1000);
    expect(
      berlinClock(new Date(now.getTime() + msUntilBerlinMidnight(now)))
    ).toBe('29/03/2027, 00:00:01');
  });

  it('hits midnight on the 25-hour day when DST ends', () => {
    // 2027-10-31 switches 03:00 -> 02:00. Berlin is at 00:30 here.
    const now = new Date('2027-10-30T22:30:00Z');

    expect(msUntilBerlinMidnight(now)).toBe(24.5 * 60 * 60 * 1000 + 1000);
    expect(
      berlinClock(new Date(now.getTime() + msUntilBerlinMidnight(now)))
    ).toBe('01/11/2027, 00:00:01');
  });

  it('lands on midnight for every hour of both switch days', () => {
    // Sweeps the switch days hour by hour: whatever the offset does in between,
    // the timer must always arrive at 00:00:01 of the following day.
    for (const startOfDay of ['2027-03-27T23:00:00Z', '2027-10-30T22:00:00Z']) {
      for (let hour = 0; hour < 24; hour += 1) {
        const now = new Date(
          new Date(startOfDay).getTime() + hour * 60 * 60 * 1000
        );
        const fires = new Date(now.getTime() + msUntilBerlinMidnight(now));

        expect(berlinClock(fires).slice(-8)).toBe('00:00:01');
      }
    }
  });
});
