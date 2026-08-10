import { useBlockPlan } from '@/hooks/useBlockPlan';
import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';

const mockUseQuery = jest.fn();
const mockIsOnline = jest.fn();
const mockGetBlockPlan = jest.fn();
const mockReadCache = jest.fn();
const mockWriteCache = jest.fn();
const mockClearCache = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  onlineManager: { isOnline: () => mockIsOnline() },
}));

jest.mock('@/lib/blockPlanApi', () => ({
  getBlockPlan: (...args: unknown[]) => mockGetBlockPlan(...args),
}));

jest.mock('@/lib/blockPlanCache', () => ({
  readCachedBlockPlan: (...args: unknown[]) => mockReadCache(...args),
  writeCachedBlockPlan: (...args: unknown[]) => mockWriteCache(...args),
  clearCachedBlockPlan: (...args: unknown[]) => mockClearCache(...args),
}));

const PLAN = {
  course: { code: 'TIF26A' },
  semesters: [
    {
      number: 1,
      phases: [
        { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
      ],
    },
  ],
};

function lastQueryOptions() {
  return mockUseQuery.mock.calls.at(-1)?.[0];
}

describe('useBlockPlan', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: false,
      isPending: true,
      refetch: jest.fn(),
    });
    mockGetBlockPlan.mockReset();
    mockReadCache.mockReset();
    mockWriteCache.mockReset();
    mockClearCache.mockReset();
    mockClearCache.mockResolvedValue(undefined);
    mockIsOnline.mockReset();
    mockIsOnline.mockReturnValue(true);
  });

  it('keys the query by the normalized course code', () => {
    useBlockPlan('wwi25a-am');

    expect(lastQueryOptions()).toEqual(
      expect.objectContaining({
        queryKey: ['blockPlan', 'WWI25A'],
        networkMode: 'always',
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
        refetchOnReconnect: 'always',
        enabled: true,
      })
    );
    expect(mockUseQuery.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        queryKey: ['blockPlanCache', 'WWI25A'],
        networkMode: 'always',
        staleTime: Infinity,
        enabled: true,
      })
    );
  });

  it('stays disabled without a course', () => {
    useBlockPlan(undefined);

    expect(lastQueryOptions()).toEqual(
      expect.objectContaining({
        queryKey: ['blockPlan', undefined],
        enabled: false,
      })
    );
  });

  it('persists the plan after a successful fetch', async () => {
    mockGetBlockPlan.mockResolvedValue(PLAN);
    useBlockPlan('TIF26A');

    const result = await lastQueryOptions().queryFn({ signal: undefined });

    expect(result).toEqual({ plan: PLAN, fromCache: false });
    expect(mockWriteCache).toHaveBeenCalledWith('TIF26A', PLAN);
  });

  it('exposes cache data while the remote query is pending', () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: PLAN,
        isPending: false,
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isError: false,
        isFetching: true,
        isPending: true,
        refetch: jest.fn(),
      });

    const result = useBlockPlan('TIF26A');

    expect(result.data).toEqual({ plan: PLAN, fromCache: true });
    expect(result.isLoading).toBe(false);
  });

  it('rethrows the error when nothing is cached', async () => {
    mockGetBlockPlan.mockRejectedValue(
      new BlockPlanError(BlockPlanErrorCode.Network)
    );
    mockReadCache.mockResolvedValue(undefined);
    useBlockPlan('TIF26A');

    await expect(
      lastQueryOptions().queryFn({ signal: undefined })
    ).rejects.toMatchObject({ code: BlockPlanErrorCode.Network });
  });

  it('treats a 404 as authoritative and does not serve a cached plan', async () => {
    // The course has no block plan, so a previously cached one must not keep
    // the feature visible.
    mockGetBlockPlan.mockRejectedValue(
      new BlockPlanError(BlockPlanErrorCode.NotFound, { status: 404 })
    );
    mockReadCache.mockResolvedValue(PLAN);
    useBlockPlan('TIF26A');

    await expect(
      lastQueryOptions().queryFn({ signal: undefined })
    ).resolves.toEqual({ plan: null, fromCache: false });
    expect(mockReadCache).not.toHaveBeenCalled();
  });

  it('drops the cached plan on a 404', async () => {
    mockGetBlockPlan.mockRejectedValue(
      new BlockPlanError(BlockPlanErrorCode.NotFound, { status: 404 })
    );
    useBlockPlan('TIF26A');

    await expect(
      lastQueryOptions().queryFn({ signal: undefined })
    ).resolves.toEqual({ plan: null, fromCache: false });
    expect(mockClearCache).toHaveBeenCalledWith('TIF26A');
  });

  describe('retry policy', () => {
    function retry(failureCount: number, error: Error): boolean {
      useBlockPlan('TIF26A');
      return lastQueryOptions().retry(failureCount, error);
    }

    it('retries a network error at most twice', () => {
      const error = new BlockPlanError(BlockPlanErrorCode.Network);

      expect(retry(0, error)).toBe(true);
      expect(retry(1, error)).toBe(true);
      expect(retry(2, error)).toBe(false);
    });

    it('does not retry while offline', () => {
      mockIsOnline.mockReturnValue(false);

      expect(retry(0, new BlockPlanError(BlockPlanErrorCode.Network))).toBe(
        false
      );
    });

    it('does not retry errors the server answered definitively', () => {
      expect(retry(0, new BlockPlanError(BlockPlanErrorCode.NotFound))).toBe(
        false
      );
      expect(retry(0, new BlockPlanError(BlockPlanErrorCode.Http))).toBe(false);
      expect(retry(0, new BlockPlanError(BlockPlanErrorCode.Parse))).toBe(
        false
      );
    });

    it('does not retry a non-BlockPlanError such as an abort', () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      expect(retry(0, abortError)).toBe(false);
    });
  });

  it('rethrows an aborted request without mutating the cache', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockGetBlockPlan.mockRejectedValue(abortError);
    useBlockPlan('TIF26A');

    await expect(
      lastQueryOptions().queryFn({ signal: undefined })
    ).rejects.toBe(abortError);
    expect(mockWriteCache).not.toHaveBeenCalled();
    expect(mockClearCache).not.toHaveBeenCalled();
  });
});
