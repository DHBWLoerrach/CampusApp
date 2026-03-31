import { useQuery } from '@tanstack/react-query';
import {
  fetchMatchIndexFromRemote,
  loadLocalMatchIndex,
  getRidesSource,
  type MatchIndex,
  type RidesSource,
} from '@/lib/ridesService';

/**
 * Fetches the rides (courses-rides) index. Caches for 24 hours.
 * Dev: switch to local file via EXPO_PUBLIC_RIDES_SOURCE=file
 */
export function useRidesIndex() {
  const source: RidesSource = getRidesSource();
  return useQuery<MatchIndex, Error>({
    queryKey: ['rides-index', source],
    queryFn: async () => {
      if (source === 'file') {
        const data = loadLocalMatchIndex();
        if (!data) throw new Error('Lokale Match-Datei nicht gefunden.');
        return data;
      }
      return await fetchMatchIndexFromRemote();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 48, // 48h
    // Only fetch once a day; don't refetch on mount while fresh
    refetchOnMount: false,
  });
}
