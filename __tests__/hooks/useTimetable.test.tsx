import type { PropsWithChildren } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';
import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { useTimetable } from '@/hooks/useTimetable';
import { CalendarErrorCode } from '@/lib/icalService';

// Only fetch is mocked; the hook runs against a real QueryClient and the real
// calendar parser.
function icsFor(summary: string): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusApp Test//EN',
    'BEGIN:VEVENT',
    `UID:${summary}`,
    `SUMMARY:${summary}`,
    'DTSTART;TZID=W. Europe Standard Time:20261103T090000',
    'DTEND;TZID=W. Europe Standard Time:20261103T121500',
    'LOCATION:S021',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:holiday',
    'SUMMARY:WEIHNACHTEN',
    'DTSTART;VALUE=DATE:20261224',
    'DTEND;VALUE=DATE:20261226',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
}

function okResponse(body: string) {
  return { ok: true, status: 200, statusText: 'OK', text: async () => body };
}

function createQueryClient() {
  // No retry delay, so the hook's own retry rule runs without waiting
  return new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
}

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useTimetable', () => {
  let queryClient: QueryClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    queryClient = createQueryClient();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Unmount before clearing, otherwise unsubscribing schedules the 12-hour
    // garbage collection timer, which keeps Jest from exiting
    await cleanup();
    onlineManager.setOnline(true);
    queryClient.clear();
    jest.restoreAllMocks();
  });

  async function renderTimetable(course?: string) {
    return renderHook(
      ({ course }: { course?: string }) => useTimetable(course),
      {
        initialProps: { course },
        wrapper: createWrapper(queryClient),
      }
    );
  }

  it('loads the course feed and groups the events by Berlin day', async () => {
    fetchMock.mockResolvedValue(okResponse(icsFor('Geschäftsprozesse')));

    const { result } = await renderTimetable(' tif25a ');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('kal-tif25a@');
    expect(Object.keys(result.current.data ?? {})).toEqual([
      '2026-11-03',
      '2026-12-24',
      '2026-12-25',
      '2026-12-26',
    ]);
    expect(result.current.data?.['2026-11-03'][0]).toMatchObject({
      title: 'Geschäftsprozesse',
      location: 'S021',
      allDay: false,
    });
  });

  it('does not fetch without a course', async () => {
    const { result } = await renderTimetable('  ');

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads the new course after a course switch', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      okResponse(icsFor(url.includes('kal-wwi24b@') ? 'WWI24B' : 'TIF25A'))
    );
    const { result, rerender } = await renderTimetable('TIF25A');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await rerender({ course: 'WWI24B' });

    await waitFor(() =>
      expect(result.current.data?.['2026-11-03'][0].title).toBe('WWI24B')
    );
    expect(fetchMock.mock.calls[1][0]).toContain('kal-wwi24b@');
  });

  it('retries network errors and recovers', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(okResponse(icsFor('TIF25A')));

    const { result } = await renderTimetable('TIF25A');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('gives up after two retries of network errors', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const { result } = await renderTimetable('TIF25A');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.code).toBe(CalendarErrorCode.Network);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry HTTP errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '',
    });

    const { result } = await renderTimetable('XYZ99');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      code: CalendarErrorCode.Http,
      status: 404,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refetches fresh data when the connection returns', async () => {
    fetchMock.mockResolvedValue(okResponse(icsFor('TIF25A')));
    const { result } = await renderTimetable('TIF25A');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => onlineManager.setOnline(false));
    await act(async () => onlineManager.setOnline(true));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('keeps the loaded timetable when a refetch fails', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(icsFor('TIF25A')));
    const { result } = await renderTimetable('TIF25A');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => '',
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.data?.['2026-11-03'][0].title).toBe('TIF25A');
  });
});
