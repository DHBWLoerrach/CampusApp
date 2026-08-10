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

const BERLIN_YMD_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

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
  // `en-CA` renders as YYYY-MM-DD, so the result is a YmdDate by construction.
  return BERLIN_YMD_FORMATTER.format(now) as YmdDate;
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

  return Date.UTC(
    partValue('year'),
    partValue('month') - 1,
    partValue('day'),
    // `hour12: false` renders midnight as 24 in some environments.
    partValue('hour') % 24,
    partValue('minute'),
    partValue('second')
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
 * two DST days, which are 23 and 25 hours long — on the March switch the timer
 * would fire at 01:00 and leave the caller a day behind until then. Instead the
 * next midnight is resolved as a real instant: the offset is applied once, then
 * re-read at the resulting instant, which settles a DST change in between.
 */
export function msUntilBerlinMidnight(now: Date = new Date()): number {
  const wallNow = berlinWallClockAsUtc(now);
  const nextMidnightWall =
    Math.floor(wallNow / MS_IN_DAY) * MS_IN_DAY + MS_IN_DAY;

  let instant = nextMidnightWall - berlinOffsetMs(now);
  instant = nextMidnightWall - berlinOffsetMs(new Date(instant));

  // Never return zero or less: a timer built on it would spin.
  return Math.max(instant - now.getTime(), 0) + 1000;
}

function utcDayKey(day: YmdDate): number {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, dayOfMonth);
}

/** Days from `from` to `to`, counting both boundary days. */
export function inclusiveDayCount(from: YmdDate, to: YmdDate): number {
  return Math.floor((utcDayKey(to) - utcDayKey(from)) / MS_IN_DAY) + 1;
}
