// Calendar arithmetic in the Europe/Berlin time zone: validated day values,
// the current Berlin day, and the distance to the next day change.
//
// Deliberately free of any domain knowledge, so anything that needs to reason
// about "today" can use it without pulling in an unrelated feature.

declare const ymdBrand: unique symbol;

/**
 * A calendar day in `YYYY-MM-DD` form that is known to exist. Every function
 * here relies on that shape, so the type can only be produced by `ymd()` or
 * `todayInBerlin()` — never by an unchecked cast from the outside.
 */
export type YmdDate = string & { readonly [ymdBrand]: true };

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const BERLIN_DATETIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function todayInBerlin(now: Date = new Date()): YmdDate {
  const day = new Date(berlinDayNumber(now) * MS_IN_DAY);
  return ymd(day.toISOString().split('T')[0]);
}

export function isValidYmd(value: unknown): value is YmdDate {
  if (typeof value !== 'string' || !YMD_PATTERN.test(value)) return false;

  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

/**
 * The only validating way into `YmdDate`. Throws on anything that is not an
 * existing calendar day, so callers cannot smuggle in `'2026-02-31'` or a
 * German-style `'01.10.2026'`.
 */
export function ymd(value: string): YmdDate {
  if (!isValidYmd(value)) {
    throw new RangeError(`Not a valid YYYY-MM-DD date: ${value}`);
  }
  return value;
}

/** Berlin wall-clock time of an instant, expressed as if it were UTC. */
function berlinWallClockAsUtc(at: Date): number {
  const parts = BERLIN_DATETIME_FORMATTER.formatToParts(at);
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const wall = new Date(0);
  wall.setUTCFullYear(
    partValue('year'),
    partValue('month') - 1,
    partValue('day')
  );
  return wall.setUTCHours(
    // `hour12: false` renders midnight as 24 in some environments.
    partValue('hour') % 24,
    partValue('minute'),
    partValue('second'),
    0
  );
}

/** Berlin's UTC offset at a given instant, in milliseconds. */
function berlinOffsetMs(at: Date): number {
  return berlinWallClockAsUtc(at) - at.getTime();
}

/**
 * Milliseconds until the Berlin calendar day flips, plus a second of slack so
 * a timer scheduled with it never fires just before the change.
 *
 * Subtracting the elapsed wall-clock time from 24 hours would be wrong on the
 * two DST days, which are 23 and 25 hours long. Resolve the following
 * calendar day's midnight as an instant before computing the delay.
 */
export function msUntilBerlinMidnight(now: Date = new Date()): number {
  const midnight = berlinMidnightForDay(berlinDayNumber(now) + 1);
  return Math.max(midnight.getTime() - now.getTime(), 0) + 1000;
}

/** Calendar days since 1970-01-01, independent of the device timezone. */
export function calendarDayNumber(
  year: number,
  month: number,
  day: number
): number {
  return new Date(0).setUTCFullYear(year, month - 1, day) / MS_IN_DAY;
}

export function berlinDayNumber(instant: Date): number {
  return Math.floor(berlinWallClockAsUtc(instant) / MS_IN_DAY);
}

function utcDayKey(day: YmdDate): number {
  return Date.parse(day + 'T00:00:00Z');
}

export function berlinMidnight(day: YmdDate): Date {
  return berlinMidnightForDay(utcDayKey(day) / MS_IN_DAY);
}

/** Resolve the start of a Berlin calendar day, including DST transitions. */
export function berlinMidnightForDay(day: number): Date {
  const wall = day * MS_IN_DAY;
  const estimate = wall - berlinOffsetMs(new Date(wall));
  return new Date(wall - berlinOffsetMs(new Date(estimate)));
}

/** Days from `from` to `to`, counting both boundary days. */
export function inclusiveDayCount(from: YmdDate, to: YmdDate): number {
  return Math.floor((utcDayKey(to) - utcDayKey(from)) / MS_IN_DAY) + 1;
}
