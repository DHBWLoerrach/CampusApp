import { addDays, format, isWeekend, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

// Canteen closure configuration.
// Dates are ISO calendar days (yyyy-MM-dd) so they compare lexicographically,
// which matches the `format(date, 'yyyy-MM-dd')` key convention used across the
// canteen code and keeps the ranges free of time zones and time-of-day.
export type CanteenClosure = {
  /** Inclusive first closed day, yyyy-MM-dd. */
  from: string;
  /** Inclusive last closed day, yyyy-MM-dd. */
  through: string;
  title: string;
  /**
   * 'service': only the food service pauses, the rooms stay open.
   * 'building': the canteen is closed entirely.
   */
  scope: 'service' | 'building';
  /** Optional extra sentence, e.g. what is still possible on site. */
  note?: string;
};

// One entry per closure, ranges must not overlap. Order does not matter.
export const CANTEEN_CLOSURES: CanteenClosure[] = [
  {
    from: '2026-08-03',
    through: '2026-09-13',
    title: 'Betriebsferien',
    scope: 'service',
    note: 'Die Räumlichkeiten der Mensa bleiben geöffnet. Gerne können Sie dort Ihre Mittagspause verbringen.',
  },
  // Winter closure: the canteen shuts completely, so no `note` about staying
  // for a break, and the reopening line reads "Wieder geöffnet ab".
  // {
  //   from: '2026-12-21',
  //   through: '2027-01-06',
  //   title: 'Weihnachtspause',
  //   scope: 'building',
  // },
];

export type ClosureInfo = {
  title: string;
  note?: string;
  scope: CanteenClosure['scope'];
  /** e.g. "4. August – 13. September 2026" */
  rangeLabel: string;
  /** Last closed day without the year, e.g. "13. September" */
  endLabel: string;
  /** e.g. "Essensausgabe wieder ab" */
  reopeningCaption: string;
  /** e.g. "Montag, 14. September" */
  reopeningLabel: string;
};

function closureContainsKey(closure: CanteenClosure, key: string): boolean {
  return key >= closure.from && key <= closure.through;
}

function closureForKey(key: string): CanteenClosure | undefined {
  return CANTEEN_CLOSURES.find((closure) => closureContainsKey(closure, key));
}

// First weekday after the closure ends. Weekends are skipped because the
// canteen only serves Mon–Fri anyway.
function reopeningDate(through: string): Date {
  let date = addDays(parseISO(through), 1);
  while (isWeekend(date)) date = addDays(date, 1);
  return date;
}

// Turns a configured closure into the strings the UI renders. Exported so both
// scopes can be covered by tests, including ones not currently configured.
export function describeClosure(closure: CanteenClosure): ClosureInfo {
  const start = parseISO(closure.from);
  const end = parseISO(closure.through);
  // Name month and year on the start only when the end does not already carry
  // them: "4. – 13. August 2026", "4. August – 13. September 2026",
  // "21. Dezember 2026 – 6. Januar 2027".
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const startPattern = sameMonth ? 'd.' : sameYear ? 'd. MMMM' : 'd. MMMM yyyy';
  const rangeStartLabel = format(start, startPattern, { locale: de });
  const rangeEndLabel = format(end, 'd. MMMM yyyy', { locale: de });

  return {
    title: closure.title,
    note: closure.note,
    scope: closure.scope,
    rangeLabel: `${rangeStartLabel} – ${rangeEndLabel}`,
    endLabel: format(end, 'd. MMMM', { locale: de }),
    reopeningCaption:
      closure.scope === 'building'
        ? 'Wieder geöffnet ab'
        : 'Essensausgabe wieder ab',
    reopeningLabel: format(reopeningDate(closure.through), 'EEEE, d. MMMM', {
      locale: de,
    }),
  };
}

export function getCanteenClosure(date: Date): ClosureInfo | null {
  const closure = closureForKey(format(date, 'yyyy-MM-dd'));
  return closure ? describeClosure(closure) : null;
}

// Returns the closure only when every given day falls into the same one. This
// decides whether the day tabs are worth showing at all: as soon as one weekday
// of the rolling window is open again, the regular tab view comes back on its
// own. Requiring a single closure keeps a window that would span two of them
// from mixing their dates.
export function getCanteenClosureForDates(dates: Date[]): ClosureInfo | null {
  if (dates.length === 0) return null;
  const first = closureForKey(format(dates[0], 'yyyy-MM-dd'));
  if (!first) return null;
  const allInSameClosure = dates.every((date) =>
    closureContainsKey(first, format(date, 'yyyy-MM-dd'))
  );
  return allInSameClosure ? describeClosure(first) : null;
}
