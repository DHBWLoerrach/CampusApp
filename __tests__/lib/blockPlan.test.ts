import { ymd } from '@/lib/berlinDate';
import {
  findCurrentPhase,
  findNextPhase,
  getPhaseDurationDays,
  getPhaseProgress,
  isBeforeFirstPhase,
  isPhaseActiveOn,
  toBlockPlanCourseCode,
} from '@/lib/blockPlanDomain';
import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';
import { parseBlockPlan } from '@/lib/blockPlanParser';

// Sample payload as delivered by the block plan API.
const RAW_PLAN = {
  course: {
    code: 'TIF26A',
    // Extra metadata the API sends but the app does not use.
    program: { name: 'Informatik', abbreviation: 'TIF' },
    studyPeriod: { startDate: '2026-10-01', endDate: '2029-09-30' },
  },
  semesters: [
    {
      number: 1,
      phases: [
        { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
        { type: 'PRACTICE', startDate: '2026-12-21', endDate: '2027-04-18' },
      ],
    },
    {
      number: 2,
      phases: [
        { type: 'THEORY', startDate: '2027-04-19', endDate: '2027-07-11' },
        { type: 'PRACTICE', startDate: '2027-07-12', endDate: '2027-09-26' },
      ],
    },
    {
      number: 5,
      phases: [
        { type: 'THEORY', startDate: '2028-09-25', endDate: '2028-12-17' },
        { type: 'PRACTICE', startDate: '2028-12-18', endDate: '2029-01-07' },
      ],
    },
    {
      number: 6,
      phases: [
        { type: 'THEORY', startDate: '2029-01-08', endDate: '2029-04-01' },
        { type: 'PRACTICE', startDate: '2029-04-02', endDate: '2029-09-30' },
      ],
    },
  ],
};

describe('parseBlockPlan', () => {
  it('parses the API payload and drops unused course metadata', () => {
    const plan = parseBlockPlan(RAW_PLAN);

    expect(plan.course).toEqual({ code: 'TIF26A' });
    expect(plan.semesters).toHaveLength(4);
    expect(plan.semesters[0].phases[0].type).toBe('THEORY');
  });

  it('sorts semesters and phases chronologically', () => {
    const plan = parseBlockPlan({
      ...RAW_PLAN,
      semesters: [
        {
          number: 2,
          phases: [
            {
              type: 'PRACTICE',
              startDate: '2027-07-12',
              endDate: '2027-09-26',
            },
            { type: 'THEORY', startDate: '2027-04-19', endDate: '2027-07-11' },
          ],
        },
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
      ],
    });

    expect(plan.semesters.map((s) => s.number)).toEqual([1, 2]);
    expect(plan.semesters[1].phases.map((p) => p.type)).toEqual([
      'THEORY',
      'PRACTICE',
    ]);
  });

  it('reports a fully readable payload as complete', () => {
    expect(parseBlockPlan(RAW_PLAN).isPartial).toBe(false);
  });

  it('flags the plan as partial when a phase had to be dropped', () => {
    // A silently missing practice phase is the dangerous case, so the loss is
    // recorded and surfaced instead of being swallowed.
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
            {
              type: 'PRACTICE',
              startDate: '21.12.2026',
              endDate: '2027-04-18',
            },
          ],
        },
      ],
    });

    expect(plan.isPartial).toBe(true);
    expect(plan.semesters[0].phases).toHaveLength(1);
  });

  it('flags the plan as partial when a whole semester had to be dropped', () => {
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
        { number: 0, phases: [] },
      ],
    });

    expect(plan.isPartial).toBe(true);
    expect(plan.semesters).toHaveLength(1);
  });

  it('does not warn about a semester whose phases are not scheduled yet', () => {
    // An empty phase list is a plan that is still being filled in. Treating it
    // as a loss would show the "incomplete" warning on an intact payload.
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
        { number: 2, phases: [] },
      ],
    });

    expect(plan.isPartial).toBe(false);
    expect(plan.semesters.map((s) => s.number)).toEqual([1]);
  });

  it('still warns when a semester lost all of its phases to parse errors', () => {
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
        {
          number: 2,
          phases: [{ type: 'THEORY', startDate: '19.04.2027' }],
        },
      ],
    });

    expect(plan.isPartial).toBe(true);
    expect(plan.semesters.map((s) => s.number)).toEqual([1]);
  });

  it('carries a stored partial flag over from a cached plan', () => {
    // Re-parsing a cached plan finds nothing to drop, so the flag would reset
    // to false and silently hide the warning after a restart.
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      isPartial: true,
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
      ],
    });

    expect(plan.isPartial).toBe(true);
  });

  it('skips malformed phases instead of failing the whole plan', () => {
    const plan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
            { type: 'THEORY', startDate: '01.10.2026', endDate: '2026-12-20' },
            { type: 'THEORY', startDate: '2026-99-99', endDate: '2026-12-20' },
            {
              type: 'PRACTICE',
              startDate: '2027-04-18',
              endDate: '2026-12-21',
            },
            { type: '', startDate: '2027-01-01', endDate: '2027-01-31' },
            { type: 'EXAM', startDate: '2027-01-01', endDate: '2027-01-31' },
          ],
        },
      ],
    });

    expect(plan.semesters[0].phases).toEqual([
      { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
    ]);
    // Partial success stays visible to the caller rather than passing as whole.
    expect(plan.isPartial).toBe(true);
  });

  it('rejects payloads whose only phases contain impossible dates', () => {
    expect(() =>
      parseBlockPlan({
        course: { code: 'TIF26A' },
        semesters: [
          {
            number: 1,
            phases: [
              {
                type: 'THEORY',
                startDate: '2026-02-31',
                endDate: '2026-03-15',
              },
            ],
          },
        ],
      })
    ).toThrow(BlockPlanError);
  });

  it('throws a parse error when no usable semester remains', () => {
    expect(() =>
      parseBlockPlan({ course: { code: 'TIF26A' }, semesters: [] })
    ).toThrow(BlockPlanError);

    try {
      parseBlockPlan({ course: {}, semesters: [] });
    } catch (error) {
      expect((error as BlockPlanError).code).toBe(BlockPlanErrorCode.Parse);
    }
  });
});

describe('findCurrentPhase', () => {
  const plan = parseBlockPlan(RAW_PLAN);

  it('treats the first day of a phase as inside it', () => {
    const current = findCurrentPhase(plan, ymd('2026-10-01'));

    expect(current?.semesterNumber).toBe(1);
    expect(current?.phase.type).toBe('THEORY');
  });

  it('treats the inclusive end date as still inside the phase', () => {
    const current = findCurrentPhase(plan, ymd('2026-12-20'));

    expect(current?.phase.type).toBe('THEORY');
    expect(current?.phase.endDate).toBe('2026-12-20');
  });

  it('moves to the next phase on the day after the end date', () => {
    const current = findCurrentPhase(plan, ymd('2026-12-21'));

    expect(current?.semesterNumber).toBe(1);
    expect(current?.phase.type).toBe('PRACTICE');
  });

  it('returns null before the study period starts', () => {
    expect(findCurrentPhase(plan, ymd('2026-09-30'))).toBeNull();
  });

  it('returns null after the last phase ended', () => {
    expect(findCurrentPhase(plan, ymd('2029-09-30'))?.phase.type).toBe(
      'PRACTICE'
    );
    expect(findCurrentPhase(plan, ymd('2029-10-01'))).toBeNull();
  });

  it('finds phases across semester boundaries', () => {
    const current = findCurrentPhase(plan, ymd('2029-01-08'));

    expect(current?.semesterNumber).toBe(6);
    expect(current?.phase.type).toBe('THEORY');
  });
});

describe('findNextPhase', () => {
  const plan = parseBlockPlan(RAW_PLAN);

  it('returns the first phase before the study period starts', () => {
    expect(findNextPhase(plan, ymd('2026-09-30'))?.phase.startDate).toBe(
      '2026-10-01'
    );
  });

  it('returns the following phase while one is running', () => {
    const next = findNextPhase(plan, ymd('2026-11-01'));

    expect(next?.phase.type).toBe('PRACTICE');
    expect(next?.phase.startDate).toBe('2026-12-21');
  });

  it('returns null once the plan is over', () => {
    expect(findNextPhase(plan, ymd('2029-09-30'))).toBeNull();
  });

  it('answers chronologically even when semester numbers run against the dates', () => {
    // The parser orders semesters by number, not by date, so a payload that
    // numbers them out of order would otherwise get the wrong "next" phase.
    const oddPlan = parseBlockPlan({
      course: { code: 'TIF26A' },
      semesters: [
        {
          number: 1,
          phases: [
            { type: 'THEORY', startDate: '2027-04-19', endDate: '2027-07-11' },
          ],
        },
        {
          number: 2,
          phases: [
            { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
          ],
        },
      ],
    });

    expect(findNextPhase(oddPlan, ymd('2026-09-30'))?.phase.startDate).toBe(
      '2026-10-01'
    );
    expect(isBeforeFirstPhase(oddPlan, ymd('2026-09-30'))).toBe(true);
    expect(isBeforeFirstPhase(oddPlan, ymd('2027-01-15'))).toBe(false);
  });
});

describe('isBeforeFirstPhase', () => {
  const plan = parseBlockPlan(RAW_PLAN);

  it('is true only ahead of the very first phase', () => {
    expect(isBeforeFirstPhase(plan, ymd('2026-09-30'))).toBe(true);
    expect(isBeforeFirstPhase(plan, ymd('2026-10-01'))).toBe(false);
  });

  it('is false in a gap between two phases', () => {
    // Semester 2 ends 2027-09-26, semester 5 starts 2028-09-25.
    expect(findCurrentPhase(plan, ymd('2028-01-15'))).toBeNull();
    expect(isBeforeFirstPhase(plan, ymd('2028-01-15'))).toBe(false);
  });

  it('is false once the plan is over', () => {
    expect(isBeforeFirstPhase(plan, ymd('2029-10-01'))).toBe(false);
  });
});

describe('phase durations', () => {
  it('is unaffected by daylight saving transitions', () => {
    // Contains the DST switch on 2027-03-28.
    expect(
      getPhaseDurationDays({
        type: 'PRACTICE',
        startDate: ymd('2027-03-22'),
        endDate: ymd('2027-04-04'),
      })
    ).toBe(14);
  });

  it('reports the short practice phase of semester 5 as 21 days', () => {
    expect(
      getPhaseDurationDays({
        type: 'PRACTICE',
        startDate: ymd('2028-12-18'),
        endDate: ymd('2029-01-07'),
      })
    ).toBe(21);
  });
});

describe('getPhaseProgress', () => {
  const phase = {
    type: 'PRACTICE' as const,
    startDate: ymd('2028-12-18'),
    endDate: ymd('2029-01-07'),
  };

  it('reports the full duration as remaining on the first day', () => {
    const progress = getPhaseProgress(phase, ymd('2028-12-18'));

    expect(progress).toEqual({
      ratio: 1 / 21,
      daysRemaining: 21,
      daysTotal: 21,
    });
  });

  it('reports a single remaining day on the last day', () => {
    const progress = getPhaseProgress(phase, ymd('2029-01-07'));

    expect(progress?.ratio).toBe(1);
    expect(progress?.daysRemaining).toBe(1);
  });

  it('returns null outside the phase', () => {
    expect(getPhaseProgress(phase, ymd('2028-12-17'))).toBeNull();
    expect(getPhaseProgress(phase, ymd('2029-01-08'))).toBeNull();
  });
});

describe('isPhaseActiveOn', () => {
  it('includes both boundary days', () => {
    const phase = {
      type: 'THEORY' as const,
      startDate: ymd('2026-10-01'),
      endDate: ymd('2026-12-20'),
    };

    expect(isPhaseActiveOn(phase, ymd('2026-09-30'))).toBe(false);
    expect(isPhaseActiveOn(phase, ymd('2026-10-01'))).toBe(true);
    expect(isPhaseActiveOn(phase, ymd('2026-12-20'))).toBe(true);
    expect(isPhaseActiveOn(phase, ymd('2026-12-21'))).toBe(false);
  });
});

describe('course code normalization', () => {
  it('uppercases the course and strips the OWA mailbox suffix', () => {
    expect(toBlockPlanCourseCode('tif26a')).toBe('TIF26A');
    expect(toBlockPlanCourseCode('WWI25A-AM')).toBe('WWI25A');
    expect(toBlockPlanCourseCode(' wwi26b-am ')).toBe('WWI26B');
  });
});
