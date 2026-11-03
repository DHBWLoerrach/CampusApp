import { act, fireEvent, render } from '@testing-library/react-native';
import RideMatchSheetContent from '@/components/schedule/RideMatchSheetContent';

const mockSetStringAsync = jest.fn();

jest.mock('expo-clipboard', () => ({
  setStringAsync: (...args: unknown[]) => mockSetStringAsync(...args),
}));

jest.mock('@/hooks/useRidesIndex', () => ({
  useRidesIndex: () => ({
    data: {
      version: 1,
      generatedAt: '2026-11-03T06:00:00Z',
      timezone: 'Europe/Berlin',
      days: [
        {
          date: '2026-11-04',
          courses: [
            {
              course: 'TIF26A',
              program: null,
              firstStartMin: 510,
              lastEndMin: 720,
            },
            {
              course: 'WWI26B',
              program: null,
              firstStartMin: 510,
              lastEndMin: 900,
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => ({ isOffline: false, isReady: true }),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#cccccc',
}));

describe('RideMatchSheetContent copy action', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-11-03T08:00:00Z') });
    mockSetStringAsync.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('writes the arrival matches to the clipboard', async () => {
    mockSetStringAsync.mockResolvedValue(true);
    const { getByLabelText, findByText } = await render(
      <RideMatchSheetContent myCourse="TIF26A" />
    );

    await act(async () => {
      fireEvent.press(getByLabelText('Ankunft (Exakt) kopieren'));
    });

    expect(mockSetStringAsync).toHaveBeenCalledTimes(1);
    expect(mockSetStringAsync.mock.calls[0][0]).toContain(
      'Ankunft 08:25 · Kurse: WWI26B'
    );
    expect(await findByText('Text kopiert')).toBeTruthy();
  });

  it('reports a failed copy instead of claiming success', async () => {
    mockSetStringAsync.mockRejectedValue(new Error('denied'));
    const { getByLabelText, findByText, queryByText } = await render(
      <RideMatchSheetContent myCourse="TIF26A" />
    );

    await act(async () => {
      fireEvent.press(getByLabelText('Ankunft (Exakt) kopieren'));
    });

    expect(await findByText('Kopieren fehlgeschlagen')).toBeTruthy();
    expect(queryByText('Text kopiert')).toBeNull();
  });
});
