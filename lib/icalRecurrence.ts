import ICAL from 'ical.js';
import {
  berlinDayNumber,
  calendarDayNumber,
  todayInBerlin,
} from './berlinDate.ts';

const MAX_RECURRENCE_ITERATIONS_PER_EVENT = 5_000;
const MAX_TOTAL_RECURRENCE_ITERATIONS = 20_000;

function berlinDayForIcalTime(time: ICAL.Time): number {
  return time.isDate
    ? calendarDayNumber(time.year, time.month, time.day)
    : berlinDayNumber(time.toJSDate());
}

/**
 * Collects all recurrence exceptions for buggy MS-Exchange exports.
 *
 * Problem: For exceptions inside a recurring series, Exchange omits the time
 * part of the RECURRENCE-ID. iCal.js therefore cannot match these exceptions
 * with their parent event. By caching the affected Berlin calendar dates we can
 * later ignore the automatically generated occurrence for that day (the real,
 * modified event will be added separately because it shows up as its own VEVENT).
 */
function getRecurrenceExceptions(
  vevents: ICAL.Component[]
): Map<string, Set<number>> {
  const result = new Map<string, Set<number>>();

  vevents.forEach((vevent) => {
    const event = new ICAL.Event(vevent);
    if (event.isRecurrenceException()) {
      let dates = result.get(event.uid);
      if (!dates) {
        dates = new Set<number>();
        result.set(event.uid, dates);
      }
      dates.add(berlinDayForIcalTime(event.recurrenceId));
    }
  });

  return result;
}

const ICAL_WEEKDAY_NUMBER: Record<string, number> = {
  SU: 1,
  MO: 2,
  TU: 3,
  WE: 4,
  TH: 5,
  FR: 6,
  SA: 7,
};

function parsePlainByDaySet(
  parts: Record<string, unknown>
): Set<number> | null {
  const keys = Object.keys(parts);
  if (keys.length !== 1 || keys[0] !== 'BYDAY') return null;
  const raw = parts.BYDAY;
  const items = Array.isArray(raw) ? raw : [raw];
  if (items.length === 0) return null;

  const set = new Set<number>();
  for (const item of items) {
    if (typeof item !== 'string') return null;
    const dow = ICAL_WEEKDAY_NUMBER[item.toUpperCase()];
    if (!dow) return null; // Reject ordinal forms like 2MO or -1FR
    set.add(dow);
  }
  return set;
}

/**
 * Computes an exact fast-forward anchor and skipped occurrence count for
 * DAILY or WEEKLY rules with plain BYDAY filters (e.g. `BYDAY=MO,TU,WE,TH,FR`)
 * and COUNT. Returns `null` if no full cycles can be skipped.
 */
function computeByDayCountSkip(
  start: ICAL.Time,
  recur: ICAL.Recur,
  bydaySet: Set<number>,
  daysDiff: number
): { anchor: ICAL.Time; skipped: number } | null {
  const interval = Math.max(1, recur.interval || 1);
  const k = bydaySet.size;
  const startDow = start.dayOfWeek(); // 1 (SU) .. 7 (SA)

  if (recur.freq === 'WEEKLY') {
    const wkst = recur.wkst || 2; // default MONDAY = 2
    const offsetInWeek = (startDow - wkst + 7) % 7;

    // DTSTART is always occurrence #1; count any remaining matching weekdays in DTSTART's week.
    let firstWeekCount = 1;
    for (let o = offsetInWeek + 1; o < 7; o += 1) {
      const dow = ((wkst - 1 + o) % 7) + 1;
      if (bydaySet.has(dow)) firstWeekCount += 1;
    }

    const daysToNextActiveWeek = 7 * interval - offsetInWeek;
    const cycleDays = 7 * interval;
    const remDays = daysDiff - daysToNextActiveWeek;
    const fullCycles = Math.floor((remDays - cycleDays - 2) / cycleDays);
    if (fullCycles < 0) return null;

    const totalSkipped = firstWeekCount + fullCycles * k;
    let firstMatchOffset = 0;
    for (let o = 0; o < 7; o += 1) {
      const dow = ((wkst - 1 + o) % 7) + 1;
      if (bydaySet.has(dow)) {
        firstMatchOffset = o;
        break;
      }
    }

    const totalAdvanceDays =
      daysToNextActiveWeek + fullCycles * cycleDays + firstMatchOffset;
    if (totalAdvanceDays <= 0) return null;

    const anchor = start.clone();
    anchor.adjust(totalAdvanceDays, 0, 0, 0);
    return { anchor, skipped: totalSkipped };
  }

  if (recur.freq === 'DAILY') {
    if (interval % 7 === 0) {
      if (!bydaySet.has(startDow)) {
        // Only DTSTART itself ever occurs, which is already before windowStart.
        return { anchor: start.clone(), skipped: Number.MAX_SAFE_INTEGER };
      }
      const steps = Math.floor((daysDiff - interval - 2) / interval);
      if (steps <= 0) return null;
      const anchor = start.clone();
      anchor.adjust(steps * interval, 0, 0, 0);
      return { anchor, skipped: steps };
    }

    let prefixCount = 0;
    let firstBlockOffsetDays = 0;
    if (!bydaySet.has(startDow)) {
      prefixCount = 1;
      for (let s = 1; s < 7; s += 1) {
        const dow = ((startDow - 1 + s * interval) % 7) + 1;
        if (bydaySet.has(dow)) {
          firstBlockOffsetDays = s * interval;
          break;
        }
      }
    }

    const blockDays = 7 * interval;
    const remDays = daysDiff - firstBlockOffsetDays;
    const fullBlocks = Math.floor((remDays - blockDays - 2) / blockDays);
    if (fullBlocks <= 0) return null;

    const anchor = start.clone();
    anchor.adjust(firstBlockOffsetDays + fullBlocks * blockDays, 0, 0, 0);
    return { anchor, skipped: prefixCount + fullBlocks * k };
  }

  return null;
}

function hasRdateOnOrAfter(vevent: ICAL.Component, minDate: Date): boolean {
  for (const prop of vevent.getAllProperties('rdate')) {
    for (const value of prop.getValues()) {
      if (value instanceof ICAL.Time && value.toJSDate() >= minDate) {
        return true;
      }
    }
  }
  return false;
}

function createCustomRecurrenceIterator(
  vevent: ICAL.Component,
  dtstart: ICAL.Time,
  adjustedRecur: ICAL.Recur | null
): ICAL.RecurExpansion {
  const iterComp = new ICAL.Component('vevent', vevent.parent);
  if (adjustedRecur) {
    iterComp.addPropertyWithValue('rrule', adjustedRecur);
  }
  for (const prop of vevent.getAllProperties('rdate')) {
    iterComp.addProperty(new ICAL.Property(prop.toJSON()));
  }
  for (const prop of vevent.getAllProperties('exdate')) {
    iterComp.addProperty(new ICAL.Property(prop.toJSON()));
  }
  return new ICAL.RecurExpansion({ component: iterComp, dtstart });
}

type Plan =
  | { kind: 'original'; prioritized: boolean }
  | { kind: 'rdates' }
  | { kind: 'aligned'; anchor: ICAL.Time; remainingCount?: number };

function planSeries(
  event: ICAL.Event,
  start: ICAL.Time,
  windowStart: Date
): Plan | null {
  const original = { kind: 'original', prioritized: false } as const;
  const recent = { kind: 'original', prioritized: true } as const;
  if (start.toJSDate() >= windowStart) return recent;
  const comp = event.component;
  const rules = comp.getAllProperties('rrule');
  if (rules.length !== 1) return original;
  const recur = rules[0].getFirstValue();
  if (!(recur instanceof ICAL.Recur)) return original;
  const remainingDates = (): Plan | null =>
    hasRdateOnOrAfter(comp, windowStart) ? { kind: 'rdates' } : null;
  if (recur.until && recur.until.toJSDate() < windowStart)
    return remainingDates();

  const daysDiff =
    berlinDayNumber(windowStart) -
    calendarDayNumber(start.year, start.month, start.day);
  if (daysDiff <= 0) return recent;

  let advance: { anchor: ICAL.Time; skipped: number } | null;
  if (recur.count != null && Object.keys(recur.parts).length) {
    if (recur.freq !== 'DAILY' && recur.freq !== 'WEEKLY') return original;
    const weekdays = parsePlainByDaySet(recur.parts);
    if (!weekdays) return original;
    advance = computeByDayCountSkip(start, recur, weekdays, daysDiff);
    if (!advance) return recent;
  } else {
    advance = alignSeries(start, recur, daysDiff, windowStart);
    if (!advance) return original;
  }

  if (recur.count == null) return { kind: 'aligned', anchor: advance.anchor };
  const remainingCount = recur.count - advance.skipped;
  return remainingCount > 0
    ? { kind: 'aligned', anchor: advance.anchor, remainingCount }
    : remainingDates();
}

function alignSeries(
  start: ICAL.Time,
  recur: ICAL.Recur,
  daysDiff: number,
  windowStart: Date
) {
  const interval = Math.max(1, recur.interval || 1);
  let steps = 0;
  let anchor: ICAL.Time | null = null;

  if (recur.freq === 'DAILY' || recur.freq === 'WEEKLY') {
    const cycleDays = (recur.freq === 'WEEKLY' ? 7 : 1) * interval;
    steps = Math.floor((daysDiff - cycleDays - 2) / cycleDays);
    if (steps > 0) {
      anchor = start.clone();
      anchor.adjust(steps * cycleDays, 0, 0, 0);
    }
  } else if (recur.freq === 'MONTHLY' && start.day <= 28) {
    const [wy, wm] = todayInBerlin(windowStart).split('-').map(Number);
    const monthsDiff = (wy - start.year) * 12 + (wm - start.month);
    steps = Math.floor((monthsDiff - interval - 1) / interval);
    if (steps > 0) {
      anchor = start.clone();
      const targetMonthIndex =
        start.year * 12 + (start.month - 1) + steps * interval;
      anchor.year = Math.floor(targetMonthIndex / 12);
      anchor.month = (targetMonthIndex % 12) + 1;
      anchor.adjust(0, 0, 0, 0);
    }
  } else if (
    recur.freq === 'YEARLY' &&
    !(start.month === 2 && start.day === 29)
  ) {
    const [wy] = todayInBerlin(windowStart).split('-').map(Number);
    const yearsDiff = wy - start.year;
    steps = Math.floor((yearsDiff - interval - 1) / interval);
    if (steps > 0) {
      anchor = start.clone();
      anchor.year = start.year + steps * interval;
      anchor.adjust(0, 0, 0, 0);
    }
  }

  return anchor ? { anchor, skipped: steps } : null;
}

function iteratorFor(event: ICAL.Event, plan: Plan) {
  if (plan.kind === 'original') return event.iterator();
  if (plan.kind === 'rdates')
    return createCustomRecurrenceIterator(
      event.component,
      event.startDate,
      null
    );
  if (plan.remainingCount === undefined) return event.iterator(plan.anchor);
  const recur = (
    event.component.getFirstPropertyValue('rrule') as ICAL.Recur
  ).clone();
  recur.count = plan.remainingCount;
  return createCustomRecurrenceIterator(event.component, plan.anchor, recur);
}

export interface Occurrence {
  item: ICAL.Event;
  start: ICAL.Time;
  end: ICAL.Time;
  uidPrefix: string;
  recurrenceKey?: string;
  explicitEnd: boolean;
}

/** Visit singles first, then window-aligned series, then newest historical series. */
export function visitOccurrences(
  components: ICAL.Component[],
  windowStart: Date,
  windowEnd: Date,
  visit: (occurrence: Occurrence) => boolean
): boolean {
  const exceptions = getRecurrenceExceptions(components);
  const queued: {
    event: ICAL.Event;
    plan: Plan;
    priority: boolean;
    startMs: number;
  }[] = [];
  let complete = true;
  for (const component of components) {
    const event = new ICAL.Event(component);
    const start = event.startDate;
    if (!start) continue;
    if (!event.isRecurring()) {
      if (
        !visit({
          item: event,
          start,
          end: event.endDate,
          uidPrefix: event.uid,
          explicitEnd: component.hasProperty('dtend'),
        })
      ) {
        return false;
      }
      continue;
    }
    const plan = planSeries(event, start, windowStart);
    if (plan) {
      queued.push({
        event,
        plan,
        priority: plan.kind !== 'original' || plan.prioritized,
        startMs: start.toJSDate().getTime(),
      });
    }
  }
  queued.sort(
    (a, b) =>
      Number(b.priority) - Number(a.priority) ||
      (a.priority ? 0 : b.startMs - a.startMs)
  );
  let budget = MAX_TOTAL_RECURRENCE_ITERATIONS;
  for (const { event, plan } of queued) {
    if (--budget < 0) return false;
    const iterator = iteratorFor(event, plan);
    let iterations = 0;
    for (;;) {
      const next = iterator.next();
      if (!next) break;
      if (--budget < 0) return false;
      if (++iterations > MAX_RECURRENCE_ITERATIONS_PER_EVENT) {
        complete = false;
        break;
      }
      const instant = next.toJSDate();
      if (instant > windowEnd) break;
      if (
        instant < windowStart ||
        exceptions.get(event.uid)?.has(berlinDayForIcalTime(next))
      ) {
        continue;
      }
      const occurrence = event.getOccurrenceDetails(next);
      if (
        !visit({
          item: occurrence.item,
          start: occurrence.startDate,
          end: occurrence.endDate,
          uidPrefix: event.uid,
          recurrenceKey: next.toString(),
          explicitEnd: event.component.hasProperty('dtend'),
        })
      ) {
        return false;
      }
    }
  }
  return complete;
}
