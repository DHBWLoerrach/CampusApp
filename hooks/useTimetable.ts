import { useQuery } from '@tanstack/react-query';
import {
  getStructuredTimetable,
  StructuredTimetable,
} from '@/lib/icalService';

/**
 * A custom React Hook to fetch and manage the timetable data for a specific course.
 * It uses React Query for caching, background updates, and state management.
 */
export function useTimetable(course?: string) {
  return useQuery<StructuredTimetable, Error>({
    // We specify the success and error types
    queryKey: ['schedule', course], // Include course in the key for proper caching per course
    queryFn: () => {
      if (!course) {
        throw new Error('Kein Kurs ausgewählt');
      }
      return getStructuredTimetable(course);
    },

    // Only run the query if we have a course
    enabled: Boolean(course && course.trim()),

    // Caching configuration:
    staleTime: 1000 * 60 * 60 * 4, // Data is considered "fresh" for 4 hours. No refetch on mount.
    gcTime: 1000 * 60 * 60 * 24, // Data stays in cache for 24 hours after being unused.
  });
}
