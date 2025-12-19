import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import RSSFeedList from '@/components/news/RSSFeedList';
import type { RSSFeed } from '@/lib/rssParser';

const mockUseOnlineStatus = jest.fn();
jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#E2001A',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@react-navigation/native', () => ({
  useScrollToTop: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  openLink: jest.fn(),
}));

const sampleFeed = (overrides?: Partial<RSSFeed>): RSSFeed => ({
  items: [
    {
      id: 'news-1',
      title: 'Beitrag 1',
      published: '2024-01-01T12:00:00Z',
      link: 'https://example.com/news-1',
    },
  ],
  ...overrides,
});

describe('RSSFeedList', () => {
  const openSettingsSpy = jest
    .spyOn(Linking, 'openSettings')
    .mockResolvedValue();

  beforeEach(() => {
    mockUseOnlineStatus.mockReset();
    mockUseQuery.mockReset();
    openSettingsSpy.mockClear();
  });

  afterAll(() => {
    openSettingsSpy.mockRestore();
  });

  it('shows offline empty state when offline and no items', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      isReady: true,
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: new Error('offline'),
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      dataUpdatedAt: 0,
    });

    const { getByText } = render(
      <RSSFeedList feedUrl="https://example.com/rss" />
    );

    expect(getByText('Keine Internetverbindung')).toBeTruthy();
    expect(
      getByText(
        'Inhalte können ohne Internetverbindung nicht geladen werden.'
      )
    ).toBeTruthy();
    expect(getByText('Einstellungen öffnen')).toBeTruthy();
    expect(getByText('Erneut versuchen')).toBeTruthy();
  });

  it('shows offline banner when offline but items exist', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      isReady: true,
    });
    mockUseQuery.mockReturnValue({
      data: sampleFeed(),
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      dataUpdatedAt: 1,
    });

    const { getByText } = render(
      <RSSFeedList feedUrl="https://example.com/rss" />
    );

    expect(getByText('Offline')).toBeTruthy();
    expect(
      getByText('Inhalte können nicht aktualisiert werden.')
    ).toBeTruthy();
    expect(getByText('Beitrag 1')).toBeTruthy();
  });

  it('shows error state when online and no items', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      isReady: true,
    });
    const refetch = jest.fn();
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
      isFetching: false,
      refetch,
      dataUpdatedAt: 0,
    });

    const { getByText } = render(
      <RSSFeedList feedUrl="https://example.com/rss" />
    );

    expect(getByText('Fehler beim Laden des RSS-Feeds')).toBeTruthy();
    fireEvent.press(getByText('Erneut versuchen'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders items when data is available', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      isReady: true,
    });
    mockUseQuery.mockReturnValue({
      data: sampleFeed(),
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      dataUpdatedAt: 0,
    });

    const { getByText } = render(
      <RSSFeedList feedUrl="https://example.com/rss" />
    );

    expect(getByText('Beitrag 1')).toBeTruthy();
  });

  it('refetches when coming back online', () => {
    const refetch = jest.fn();
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      isReady: true,
    });
    mockUseQuery.mockReturnValue({
      data: sampleFeed(),
      error: null,
      isLoading: false,
      isFetching: false,
      refetch,
      dataUpdatedAt: 1,
    });

    const { rerender } = render(
      <RSSFeedList feedUrl="https://example.com/rss" />
    );

    // Simulate coming back online
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      isReady: true,
    });
    rerender(<RSSFeedList feedUrl="https://example.com/rss" />);

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
