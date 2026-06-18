import { useRidesIndex } from '@/hooks/useRidesIndex';

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('@/lib/ridesService', () => ({
  fetchMatchIndexFromRemote: jest.fn(),
  loadLocalMatchIndex: jest.fn(),
  getRidesSource: () => 'remote',
}));

describe('useRidesIndex', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('always refetches on reconnect even while cached data is fresh', () => {
    useRidesIndex();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['rides-index', 'remote'],
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnReconnect: 'always',
      })
    );
  });
});
