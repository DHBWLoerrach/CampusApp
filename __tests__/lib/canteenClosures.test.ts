import { addDays, parseISO, subDays } from 'date-fns';
import {
  CANTEEN_CLOSURES,
  describeClosure,
  getCanteenClosure,
  getCanteenClosureForDates,
  type CanteenClosure,
} from '@/lib/canteenClosures';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

// Fixtures for describeClosure, so both scopes are covered even while only one
// of them is configured.
const summerBreak: CanteenClosure = {
  from: '2026-08-04',
  through: '2026-09-13',
  title: 'Betriebsferien',
  scope: 'service',
  note: 'Die Räumlichkeiten der Mensa bleiben geöffnet.',
};

const winterBreak: CanteenClosure = {
  from: '2026-12-21',
  through: '2027-01-06',
  title: 'Weihnachtspause',
  scope: 'building',
};

describe('canteen closure configuration', () => {
  it('uses ISO calendar days so ranges compare lexicographically', () => {
    for (const closure of CANTEEN_CLOSURES) {
      expect(closure.from).toMatch(ISO_DAY);
      expect(closure.through).toMatch(ISO_DAY);
    }
  });

  it('has no closure that ends before it starts', () => {
    for (const closure of CANTEEN_CLOSURES) {
      expect(closure.from.localeCompare(closure.through)).toBeLessThanOrEqual(
        0
      );
    }
  });

  it('has no overlapping closures', () => {
    const sorted = [...CANTEEN_CLOSURES].sort((a, b) =>
      a.from.localeCompare(b.from)
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].through.localeCompare(sorted[i].from)).toBeLessThan(
        0
      );
    }
  });

  it('gives every closure a title', () => {
    for (const closure of CANTEEN_CLOSURES) {
      expect(closure.title.trim()).not.toBe('');
    }
  });
});

describe('describeClosure', () => {
  it('describes the range in German, with the year once when it does not span years', () => {
    expect(describeClosure(summerBreak).rangeLabel).toBe(
      '4. August – 13. September 2026'
    );
  });

  it('repeats the year on both ends when the closure spans a year boundary', () => {
    expect(describeClosure(winterBreak).rangeLabel).toBe(
      '21. Dezember 2026 – 6. Januar 2027'
    );
  });

  it('names the food service when only the service pauses', () => {
    expect(describeClosure(summerBreak).reopeningCaption).toBe(
      'Essensausgabe wieder ab'
    );
  });

  it('speaks of the canteen as a whole when the building is closed', () => {
    expect(describeClosure(winterBreak).reopeningCaption).toBe(
      'Wieder geöffnet ab'
    );
  });

  it('reopens on the next weekday, skipping the weekend', () => {
    // 13.09.2026 is a Sunday, so the canteen reopens on Monday.
    expect(describeClosure(summerBreak).reopeningLabel).toBe(
      'Montag, 14. September'
    );
  });

  it('reopens on the following day when that is a weekday', () => {
    // 06.01.2027 is a Wednesday.
    expect(describeClosure(winterBreak).reopeningLabel).toBe(
      'Donnerstag, 7. Januar'
    );
  });

  it('carries the scope through so views can word the status themselves', () => {
    expect(describeClosure(summerBreak).scope).toBe('service');
    expect(describeClosure(winterBreak).scope).toBe('building');
  });

  it('carries the note through, and leaves it out when there is none', () => {
    expect(describeClosure(summerBreak).note).toBe(summerBreak.note);
    expect(describeClosure(winterBreak).note).toBeUndefined();
  });
});

const describeConfigured =
  CANTEEN_CLOSURES.length > 0 ? describe : describe.skip;

describeConfigured('getCanteenClosure', () => {
  const configured = CANTEEN_CLOSURES[0];

  it('reports a closure on the first day of a range', () => {
    expect(getCanteenClosure(parseISO(configured.from))).not.toBeNull();
  });

  it('reports a closure on the last day of a range', () => {
    expect(getCanteenClosure(parseISO(configured.through))).not.toBeNull();
  });

  it('reports no closure the day before a range', () => {
    expect(getCanteenClosure(subDays(parseISO(configured.from), 1))).toBeNull();
  });

  it('reports no closure the day after a range', () => {
    expect(
      getCanteenClosure(addDays(parseISO(configured.through), 1))
    ).toBeNull();
  });

  it('reports the closure the day falls into', () => {
    expect(getCanteenClosure(parseISO(configured.from))?.title).toBe(
      configured.title
    );
  });
});

describeConfigured('getCanteenClosureForDates', () => {
  const configured = CANTEEN_CLOSURES[0];
  const from = parseISO(configured.from);
  const through = parseISO(configured.through);

  it('reports a closure when every day falls into the same one', () => {
    expect(getCanteenClosureForDates([from, through])).not.toBeNull();
  });

  it('reports no closure when a single day is already open again', () => {
    expect(getCanteenClosureForDates([from, addDays(through, 1)])).toBeNull();
  });

  it('reports no closure when every day is outside the ranges', () => {
    expect(
      getCanteenClosureForDates([subDays(from, 2), subDays(from, 1)])
    ).toBeNull();
  });

  it('reports no closure for an empty window', () => {
    expect(getCanteenClosureForDates([])).toBeNull();
  });
});

describe('without any configured closure', () => {
  it('never reports a closure', () => {
    if (CANTEEN_CLOSURES.length > 0) return;
    const day = new Date(2026, 7, 4);
    expect(getCanteenClosure(day)).toBeNull();
    expect(getCanteenClosureForDates([day])).toBeNull();
  });
});
