import { useTimetable } from '@/hooks/useTimetable';

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

describe('useTimetable', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('always refetches on reconnect even while cached data is fresh', () => {
    useTimetable('TIF25A');

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['schedule', 'TIF25A'],
        staleTime: 1000 * 60 * 60 * 4,
        refetchOnReconnect: 'always',
      })
    );
  });
});
