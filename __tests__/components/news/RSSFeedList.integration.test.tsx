import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from '@testing-library/react-native';
import RSSFeedList from '@/components/news/RSSFeedList';

jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => ({ isOnline: true, isOffline: false, isReady: true }),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#E2001A',
}));

jest.mock('expo-image', () => ({ Image: 'Image' }));

jest.mock('expo-router/react-navigation', () => ({
  useScrollToTop: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({ openLink: jest.fn() }));

const FEED_URL = 'https://example.com/rss';
const FEED_QUERY_KEY = ['rss', FEED_URL] as const;
const FEED_XML = [
  '<rss version="2.0"><channel><title>News</title><item>',
  '<title>Beitrag 1</title><guid>news-1</guid>',
  '<link>https://example.com/news-1</link>',
  '</item></channel></rss>',
].join('');

function mockResponse(
  body: string,
  overrides: Partial<Response> = {}
): Response {
  return {
    ok: true,
    status: 200,
    text: async () => body,
    ...overrides,
  } as Response;
}

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

async function triggerPullToRefresh(screen: RenderResult) {
  await act(() => {
    screen.getByTestId('rss-feed-list').props.refreshControl.props.onRefresh();
  });
}

describe('RSSFeedList integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Control retry and cache timers; waitFor advances the clock automatically.
    jest.useFakeTimers();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retryDelay: 0, gcTime: Infinity } },
    });
  });

  afterEach(async () => {
    cleanup();
    await queryClient.cancelQueries();
    queryClient.clear();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the error state and retries after an HTTP failure', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse('<html><body>Service unavailable</body></html>', {
        ok: false,
        status: 503,
      })
    );
    const screen = await render(<RSSFeedList feedUrl={FEED_URL} />, {
      wrapper: createWrapper(queryClient),
    });

    expect(
      await screen.findByText('Inhalte konnten nicht geladen werden')
    ).toBeTruthy();
    expect(screen.queryByText('Keine Einträge gefunden.')).toBeNull();

    fetchMock.mockResolvedValue(mockResponse(FEED_XML));
    await fireEvent.press(screen.getByText('Erneut versuchen'));

    expect(await screen.findByText('Beitrag 1')).toBeTruthy();
    expect(
      screen.queryByText('Inhalte konnten nicht geladen werden')
    ).toBeNull();
  });

  it.each([
    {
      label: 'HTTP failure',
      body: '<html><body>Service unavailable</body></html>',
      response: { ok: false, status: 503 },
    },
    {
      label: 'unexpected HTML response',
      body: '<html><body>Maintenance</body></html>',
      response: {},
    },
    {
      label: 'truncated XML with an empty channel',
      body: '<rss><channel><title>a',
      response: {},
    },
    {
      label: 'truncated XML containing an item',
      body: '<rss><channel><item><title>Partial news</title><guid>partial-1</guid>',
      response: {},
    },
  ])(
    'shows a refresh warning after $label and clears it after a successful refresh',
    async ({ body, response }) => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(mockResponse(FEED_XML));
      const screen = await render(<RSSFeedList feedUrl={FEED_URL} />, {
        wrapper: createWrapper(queryClient),
      });

      expect(await screen.findByText('Beitrag 1')).toBeTruthy();
      expect(screen.queryByText('Nicht aktualisiert')).toBeNull();
      const previousData = queryClient.getQueryData(FEED_QUERY_KEY);
      fetchMock.mockResolvedValue(mockResponse(body, response));

      await triggerPullToRefresh(screen);

      await waitFor(() => {
        expect(queryClient.getQueryState(FEED_QUERY_KEY)?.status).toBe('error');
      });
      expect(queryClient.getQueryData(FEED_QUERY_KEY)).toBe(previousData);
      expect(screen.getByText('Beitrag 1')).toBeTruthy();
      expect(await screen.findByText('Nicht aktualisiert')).toBeTruthy();
      expect(
        screen.getByText(
          'Die Inhalte konnten nicht aktualisiert werden. Es werden zuletzt geladene Inhalte angezeigt.'
        )
      ).toBeTruthy();
      expect(screen.queryByText('Keine Einträge gefunden.')).toBeNull();
      expect(screen.queryByText('Partial news')).toBeNull();

      fetchMock.mockResolvedValue(
        mockResponse(FEED_XML.replace('Beitrag 1', 'Beitrag 2'))
      );

      await triggerPullToRefresh(screen);

      expect(await screen.findByText('Beitrag 2')).toBeTruthy();
      expect(screen.queryByText('Nicht aktualisiert')).toBeNull();
    }
  );
});
