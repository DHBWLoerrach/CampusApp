import { useQuery } from '@tanstack/react-query';
import {
  getStructuredTimetable,
  StructuredTimetable,
} from '@/lib/icalService';

/**
 * A custom React Hook to fetch and manage the timetable data.
 * It uses React Query for caching, background updates, and state management.
 */
export function useTimetable() {
  return useQuery<StructuredTimetable, Error>({
    // We specify the success and error types
    queryKey: ['schedule'], // A unique key to identify this data in the cache.
    queryFn: getStructuredTimetable, // The function that fetches the data.

    // Caching configuration:
    staleTime: 1000 * 60 * 60 * 4, // Data is considered "fresh" for 4 hours. No refetch on mount.
    gcTime: 1000 * 60 * 60 * 24, // Data stays in cache for 24 hours after being unused.
  });
}
