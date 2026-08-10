import {
  formatDay,
  formatPhaseDuration,
  formatPhaseRange,
  formatRemaining,
  getPhaseDisplay,
} from '@/components/schedule/blockPlanPhaseDisplay';
import {
  getBlockPlanErrorMessage,
  BLOCK_PLAN_OFFLINE_MESSAGE,
} from '@/components/schedule/blockPlanErrorMessage';
import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';
import { ymd } from '@/lib/berlinDate';

describe('getPhaseDisplay', () => {
  it('labels both phase types', () => {
    expect(getPhaseDisplay('THEORY')).toEqual({
      label: 'Theoriephase',
      icon: 'graduationcap',
    });
    expect(getPhaseDisplay('PRACTICE')).toEqual({
      label: 'Praxisphase',
      icon: 'briefcase',
    });
  });
});

describe('formatDay', () => {
  it('formats a day in German', () => {
    expect(formatDay(ymd('2027-09-27'))).toBe('27. Sep. 2027');
    expect(formatDay(ymd('2026-10-01'))).toBe('1. Okt. 2026');
  });
});

describe('formatPhaseRange', () => {
  it('drops the redundant year when both days share it', () => {
    expect(
      formatPhaseRange({
        type: 'THEORY',
        startDate: ymd('2027-09-27'),
        endDate: ymd('2027-12-19'),
      })
    ).toBe('27. Sep. – 19. Dez. 2027');
  });

  it('keeps both years when the phase spans a turn of the year', () => {
    expect(
      formatPhaseRange({
        type: 'PRACTICE',
        startDate: ymd('2028-12-18'),
        endDate: ymd('2029-01-07'),
      })
    ).toBe('18. Dez. 2028 – 7. Jan. 2029');
  });

  it('handles a single-day phase', () => {
    expect(
      formatPhaseRange({
        type: 'THEORY',
        startDate: ymd('2027-01-04'),
        endDate: ymd('2027-01-04'),
      })
    ).toBe('4. Jan. – 4. Jan. 2027');
  });
});

describe('formatPhaseDuration', () => {
  it('counts days below two weeks', () => {
    expect(formatPhaseDuration(1)).toBe('1 Tag');
    expect(formatPhaseDuration(5)).toBe('5 Tage');
    expect(formatPhaseDuration(13)).toBe('13 Tage');
  });

  it('switches to whole weeks from two weeks on', () => {
    expect(formatPhaseDuration(14)).toBe('2 Wochen');
    expect(formatPhaseDuration(21)).toBe('3 Wochen');
    // 87 days round to the nearest whole week.
    expect(formatPhaseDuration(87)).toBe('12 Wochen');
  });
});

describe('formatRemaining', () => {
  it('announces the last day instead of a count', () => {
    expect(formatRemaining(1)).toBe('letzter Tag');
    expect(formatRemaining(0)).toBe('letzter Tag');
  });

  it('counts days below two weeks and weeks above', () => {
    expect(formatRemaining(3)).toBe('noch 3 Tage');
    expect(formatRemaining(13)).toBe('noch 13 Tage');
    expect(formatRemaining(14)).toBe('noch 2 Wochen');
    expect(formatRemaining(80)).toBe('noch 11 Wochen');
  });
});

describe('getBlockPlanErrorMessage', () => {
  it('explains each error code', () => {
    expect(
      getBlockPlanErrorMessage(new BlockPlanError(BlockPlanErrorCode.NotFound))
    ).toBe('Für diesen Kurs ist kein Blockplan hinterlegt.');
    expect(
      getBlockPlanErrorMessage(new BlockPlanError(BlockPlanErrorCode.Network))
    ).toContain('nicht erreichbar');
    expect(
      getBlockPlanErrorMessage(new BlockPlanError(BlockPlanErrorCode.Parse))
    ).toContain('ungültiges Format');
    expect(
      getBlockPlanErrorMessage(
        new BlockPlanError(BlockPlanErrorCode.InvalidCourse)
      )
    ).toBe('Es wurde kein Kurs ausgewählt.');
  });

  it('includes the status code of an HTTP error', () => {
    expect(
      getBlockPlanErrorMessage(
        new BlockPlanError(BlockPlanErrorCode.Http, { status: 503 })
      )
    ).toBe('Der Blockplan-Dienst hat mit HTTP 503 geantwortet.');
  });

  it('stays readable when an HTTP error carries no status', () => {
    expect(
      getBlockPlanErrorMessage(new BlockPlanError(BlockPlanErrorCode.Http))
    ).toBe('Der Blockplan-Dienst hat mit HTTP Fehler geantwortet.');
  });

  it('falls back for errors from outside the block plan code', () => {
    const fallback =
      'Der Blockplan konnte nicht geladen werden. Bitte versuche es erneut.';

    expect(getBlockPlanErrorMessage(new Error('boom'))).toBe(fallback);
    expect(getBlockPlanErrorMessage(undefined)).toBe(fallback);
  });
});

describe('BlockPlanError', () => {
  it('carries a technical message distinct from the user-facing one', () => {
    const error = new BlockPlanError(BlockPlanErrorCode.Http, { status: 503 });

    expect(error.name).toBe('BlockPlanError');
    expect(error.message).toBe(
      'The block plan service returned an error (HTTP 503)'
    );
    expect(error.status).toBe(503);
  });

  it('keeps the original failure as its cause', () => {
    const cause = new TypeError('Network request failed');

    expect(
      new BlockPlanError(BlockPlanErrorCode.Network, { cause }).cause
    ).toBe(cause);
  });
});

describe('offline copy', () => {
  it('is worded for a blocked first load', () => {
    expect(BLOCK_PLAN_OFFLINE_MESSAGE).toContain('ohne Internetverbindung');
  });
});
