import type { PropsWithChildren } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useBlockPlan } from '@/hooks/useBlockPlan';
import { ymd } from '@/lib/berlinDate';
import type { BlockPlan } from '@/lib/blockPlanDomain';
import { writeCachedBlockPlan } from '@/lib/blockPlanCache';

const mockStorageValues = new Map<string, string>();

jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorageValues.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorageValues.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorageValues.delete(key);
    }),
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

const UPDATED_PLAN: BlockPlan = {
  ...PLAN,
  semesters: [
    ...PLAN.semesters,
    {
      number: 2,
      phases: [
        {
          type: 'PRACTICE',
          startDate: ymd('2026-12-21'),
          endDate: ymd('2027-03-31'),
        },
      ],
    },
  ],
};

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useBlockPlan integration', () => {
  beforeEach(() => {
    mockStorageValues.clear();
    global.fetch = jest.fn();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    jest.restoreAllMocks();
  });

  it('returns the persisted plan on an offline cold start', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);
    onlineManager.setOnline(false);
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError('Network request failed')
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result, unmount } = renderHook(() => useBlockPlan('TIF26A'), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await waitFor(() => {
        expect(result.current.data).toEqual({
          plan: PLAN,
          fromCache: true,
        });
      });
    } finally {
      unmount();
      queryClient.clear();
    }
  });

  it('exposes a persisted plan while the network request is still pending', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);

    let resolveFetch: ((response: unknown) => void) | undefined;
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result, unmount } = renderHook(() => useBlockPlan('TIF26A'), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await waitFor(() => {
        expect(result.current.data).toEqual({
          plan: PLAN,
          fromCache: true,
        });
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      resolveFetch?.({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => PLAN,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          plan: PLAN,
          fromCache: false,
        });
      });
    } finally {
      resolveFetch?.({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => PLAN,
      });
      unmount();
      queryClient.clear();
    }
  });

  it('stops exposing a previously loaded plan after a later 404', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => PLAN,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result, unmount } = renderHook(() => useBlockPlan('TIF26A'), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await waitFor(() => {
        expect(result.current.data?.plan).toEqual(PLAN);
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data?.plan).toBeNull();
      });
    } finally {
      unmount();
      queryClient.clear();
    }
  });

  it('refreshes a persisted fallback when the connection returns', async () => {
    await writeCachedBlockPlan('TIF26A', PLAN);
    onlineManager.setOnline(false);
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => UPDATED_PLAN,
      });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result, unmount } = renderHook(() => useBlockPlan('TIF26A'), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await waitFor(() => {
        expect(result.current.data).toEqual({
          plan: PLAN,
          fromCache: true,
        });
      });

      act(() => {
        onlineManager.setOnline(true);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          plan: UPDATED_PLAN,
          fromCache: false,
        });
      });
    } finally {
      unmount();
      queryClient.clear();
    }
  });
});
