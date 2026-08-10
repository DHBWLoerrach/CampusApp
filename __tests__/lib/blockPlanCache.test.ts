import { ymd } from '@/lib/berlinDate';
import type { BlockPlan } from '@/lib/blockPlanDomain';
import {
  clearCachedBlockPlan,
  readCachedBlockPlan,
  writeCachedBlockPlan,
} from '@/lib/blockPlanCache';

// Jest hoists `jest.mock` above these declarations, so the factory may only
// close over variables whose name starts with `mock`.
const mockStore = new Map<string, string>();
const mockGetItem = jest.fn(async (key: string) => mockStore.get(key) ?? null);
const mockSetItem = jest.fn(async (key: string, value: string) => {
  mockStore.set(key, value);
});
const mockRemoveItem = jest.fn(async (key: string) => {
  mockStore.delete(key);
});

jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItem: (key: string) => mockGetItem(key),
    setItem: (key: string, value: string) => mockSetItem(key, value),
    removeItem: (key: string) => mockRemoveItem(key),
  },
}));

const PLAN: BlockPlan = {
  course: { code: 'TIF26A' },
  isPartial: false,
  semesters: [
    {
      number: 1,
      phases: [
        {
          type: 'THEORY',
          startDate: ymd('2026-10-01'),
          endDate: ymd('2026-12-20'),
        },
      ],
    },
  ],
};

describe('block plan cache', () => {
  beforeEach(() => {
    mockStore.clear();
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('round-trips a plan', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);

    await expect(readCachedBlockPlan('TIF26A')).resolves.toEqual(PLAN);
  });

  it('uses one key per course regardless of how it is spelled', async () => {
    const wwiPlan: BlockPlan = { ...PLAN, course: { code: 'WWI25A' } };

    await writeCachedBlockPlan('wwi25a-am', wwiPlan);

    expect(mockSetItem).toHaveBeenCalledWith(
      'blockPlanCache:WWI25A',
      expect.any(String)
    );
    await expect(readCachedBlockPlan('WWI25A')).resolves.toEqual(wwiPlan);
  });

  it('refuses to store a plan under a different course', async () => {
    // The key alone would make another course's dates look like this one's.
    await writeCachedBlockPlan('WWI25A', PLAN);

    expect(mockSetItem).not.toHaveBeenCalled();
    await expect(readCachedBlockPlan('WWI25A')).resolves.toBeUndefined();
  });

  it('accepts the alias spelling of the plan it stores', async () => {
    // The API may answer with the alias form, which must not read as a
    // mismatch against the plain course code.
    await writeCachedBlockPlan('WWI25A', {
      ...PLAN,
      course: { code: 'wwi25a-am' },
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      'blockPlanCache:WWI25A',
      expect.any(String)
    );
  });

  it('discards and deletes an entry filed under the wrong course', async () => {
    // Written by a version that cached without checking the course.
    mockStore.set('blockPlanCache:WWI25A', JSON.stringify(PLAN));

    await expect(readCachedBlockPlan('WWI25A')).resolves.toBeUndefined();
    expect(mockRemoveItem).toHaveBeenCalledWith('blockPlanCache:WWI25A');
  });

  it('keeps the partial flag across a round-trip', async () => {
    // The dropped phases are gone by the time the plan is written, so the flag
    // cannot be re-derived on read — it has to survive as stored state.
    // Otherwise the "incomplete" warning vanishes after a restart.
    await writeCachedBlockPlan('TIF26A', { ...PLAN, isPartial: true });

    await expect(readCachedBlockPlan('TIF26A')).resolves.toMatchObject({
      isPartial: true,
    });
  });

  it('does not invent a partial flag for an intact plan', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);

    await expect(readCachedBlockPlan('TIF26A')).resolves.toMatchObject({
      isPartial: false,
    });
  });

  it('returns undefined when nothing is cached', async () => {
    await expect(readCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
  });

  it('discards a corrupted entry instead of throwing', async () => {
    mockStore.set('blockPlanCache:TIF26A', '{ not json');

    await expect(readCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
  });

  it('discards an entry that no longer matches the schema', async () => {
    // Written by an older app version whose payload shape has since changed.
    mockStore.set(
      'blockPlanCache:TIF26A',
      JSON.stringify({ course: { code: 'TIF26A' }, semesters: [] })
    );

    await expect(readCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
  });

  it('survives a failing storage backend', async () => {
    mockGetItem.mockRejectedValueOnce(new Error('database is locked'));
    mockSetItem.mockRejectedValueOnce(new Error('disk full'));
    mockRemoveItem.mockRejectedValueOnce(new Error('database is locked'));

    await expect(readCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
    await expect(writeCachedBlockPlan('TIF26A', PLAN)).resolves.toBeUndefined();
    await expect(clearCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
  });

  it('clears a cached plan', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);
    await clearCachedBlockPlan('TIF26A');

    expect(mockRemoveItem).toHaveBeenCalledWith('blockPlanCache:TIF26A');
    await expect(readCachedBlockPlan('TIF26A')).resolves.toBeUndefined();
  });

  it('ignores a blank course without touching storage', async () => {
    await readCachedBlockPlan('  ');
    await writeCachedBlockPlan('  ', PLAN);
    await clearCachedBlockPlan('  ');

    expect(mockGetItem).not.toHaveBeenCalled();
    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });
});
