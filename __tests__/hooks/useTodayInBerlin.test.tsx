import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useTodayInBerlin } from '@/hooks/useTodayInBerlin';

describe('useTodayInBerlin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2027-06-30T21:30:00Z')); // 23:30 in Berlin
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('starts on the current Berlin day', () => {
    const { result } = renderHook(() => useTodayInBerlin());

    expect(result.current).toBe('2027-06-30');
  });

  it('rolls over once Berlin midnight passes', () => {
    const { result } = renderHook(() => useTodayInBerlin());

    act(() => {
      jest.setSystemTime(new Date('2027-06-30T22:00:01Z')); // 00:00 in Berlin
      jest.advanceTimersByTime(30 * 60 * 1000 + 1000);
    });

    expect(result.current).toBe('2027-07-01');
  });

  it('resyncs when the app returns to the foreground', () => {
    // Timers are unreliable in the background, so a resume must re-read the day.
    let notify: ((state: string) => void) | undefined;
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, handler) => {
        notify = handler as (state: string) => void;
        return { remove: jest.fn() } as never;
      });

    const { result } = renderHook(() => useTodayInBerlin());
    expect(result.current).toBe('2027-06-30');

    act(() => {
      jest.setSystemTime(new Date('2027-07-02T09:00:00Z'));
      notify?.('active');
    });

    expect(result.current).toBe('2027-07-02');
  });

  it('ignores a move to the background', () => {
    let notify: ((state: string) => void) | undefined;
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, handler) => {
        notify = handler as (state: string) => void;
        return { remove: jest.fn() } as never;
      });

    const { result } = renderHook(() => useTodayInBerlin());

    act(() => {
      jest.setSystemTime(new Date('2027-07-02T09:00:00Z'));
      notify?.('background');
    });

    expect(result.current).toBe('2027-06-30');
  });

  it('cleans up its timer and subscription on unmount', () => {
    const remove = jest.fn();
    jest
      .spyOn(AppState, 'addEventListener')
      .mockReturnValue({ remove } as never);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useTodayInBerlin());
    unmount();

    expect(remove).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
