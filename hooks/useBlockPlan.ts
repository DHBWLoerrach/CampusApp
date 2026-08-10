import { onlineManager, useQuery } from '@tanstack/react-query';
import { toBlockPlanCourseCode, type BlockPlan } from '@/lib/blockPlanDomain';
import {
  BlockPlanError,
  BlockPlanErrorCode,
  isBlockPlanErrorCode,
} from '@/lib/blockPlanError';
import { getBlockPlan } from '@/lib/blockPlanApi';
import {
  clearCachedBlockPlan,
  readCachedBlockPlan,
  writeCachedBlockPlan,
} from '@/lib/blockPlanCache';

export interface BlockPlanResult {
  /** Null means the API authoritatively reported that the course has no plan. */
  plan: BlockPlan | null;
  /** True while the locally cached plan is shown instead of a remote result. */
  fromCache: boolean;
}

/**
 * Fetches the block plan (theory/practice phases) for a course.
 *
 * A block plan is fixed for the entire study period, so it is cached far more
 * aggressively than the timetable. The persisted copy is loaded alongside the
 * request so it can render immediately on cold and offline starts.
 */
export function useBlockPlan(course?: string) {
  const normalizedCourse = course?.trim()
    ? toBlockPlanCourseCode(course)
    : undefined;

  const cachedQuery = useQuery<BlockPlan | null>({
    queryKey: ['blockPlanCache', normalizedCourse],
    queryFn: async () =>
      (await readCachedBlockPlan(normalizedCourse ?? '')) ?? null,
    enabled: Boolean(normalizedCourse),
    networkMode: 'always',
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  // Typed as `Error`, not `BlockPlanError`: an aborted request rejects with the
  // raw AbortError, which `getBlockPlan` deliberately passes through.
  const remoteQuery = useQuery<BlockPlanResult, Error>({
    queryKey: ['blockPlan', normalizedCourse],
    networkMode: 'always',
    queryFn: async ({ signal }) => {
      if (!normalizedCourse) {
        throw new BlockPlanError(BlockPlanErrorCode.InvalidCourse);
      }

      try {
        const plan = await getBlockPlan(normalizedCourse, signal);
        await writeCachedBlockPlan(normalizedCourse, plan);
        return { plan, fromCache: false };
      } catch (error) {
        // A 404 is authoritative: the course has no block plan. Serving a stale
        // copy would keep the entry point visible for a plan that is gone.
        if (isBlockPlanErrorCode(error, BlockPlanErrorCode.NotFound)) {
          await clearCachedBlockPlan(normalizedCourse);
          return { plan: null, fromCache: false };
        }

        throw error;
      }
    },

    enabled: Boolean(normalizedCourse),

    // The plan barely ever changes, so refetching is mostly pointless traffic.
    staleTime: 1000 * 60 * 60 * 24, // fresh for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // keep in memory for 7 days
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    retry: (failureCount, error) =>
      onlineManager.isOnline() &&
      isBlockPlanErrorCode(error, BlockPlanErrorCode.Network) &&
      failureCount < 2,
  });

  const cachedData = cachedQuery.data
    ? { plan: cachedQuery.data, fromCache: true }
    : undefined;
  const data = remoteQuery.data ?? cachedData;

  return {
    data,
    error: remoteQuery.error,
    isError: remoteQuery.isError,
    isFetching: remoteQuery.isFetching,
    isLoading:
      Boolean(normalizedCourse) &&
      data === undefined &&
      (cachedQuery.isPending || remoteQuery.isPending),
    refetch: remoteQuery.refetch,
  };
}
