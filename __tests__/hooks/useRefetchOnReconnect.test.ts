import { renderHook } from '@testing-library/react-native';
import { useRefetchOnReconnect } from '@/hooks/useRefetchOnReconnect';

type HookProps = {
  isOnline: boolean;
  isReady: boolean;
  onReconnect: () => void;
};

describe('useRefetchOnReconnect', () => {
  it('does not call onReconnect on initial render when online', () => {
    const onReconnect = jest.fn();

    renderHook(() =>
      useRefetchOnReconnect({ isOnline: true, isReady: true, onReconnect }),
    );

    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('does not call onReconnect on initial render when offline', () => {
    const onReconnect = jest.fn();

    renderHook(() =>
      useRefetchOnReconnect({ isOnline: false, isReady: true, onReconnect }),
    );

    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('calls onReconnect when transitioning from offline to online', () => {
    const onReconnect = jest.fn();

    const { rerender } = renderHook<void, HookProps>(
      ({ isOnline, isReady, onReconnect }) =>
        useRefetchOnReconnect({ isOnline, isReady, onReconnect }),
      { initialProps: { isOnline: false, isReady: true, onReconnect } },
    );

    expect(onReconnect).not.toHaveBeenCalled();

    // Transition to online
    rerender({ isOnline: true, isReady: true, onReconnect });

    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('does not call onReconnect when transitioning from online to offline', () => {
    const onReconnect = jest.fn();

    const { rerender } = renderHook<void, HookProps>(
      ({ isOnline, isReady, onReconnect }) =>
        useRefetchOnReconnect({ isOnline, isReady, onReconnect }),
      { initialProps: { isOnline: true, isReady: true, onReconnect } },
    );

    // Transition to offline
    rerender({ isOnline: false, isReady: true, onReconnect });

    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('does not call onReconnect when isReady is false', () => {
    const onReconnect = jest.fn();

    const { rerender } = renderHook<void, HookProps>(
      ({ isOnline, isReady, onReconnect }) =>
        useRefetchOnReconnect({ isOnline, isReady, onReconnect }),
      { initialProps: { isOnline: false, isReady: false, onReconnect } },
    );

    // Transition to online while not ready
    rerender({ isOnline: true, isReady: false, onReconnect });

    expect(onReconnect).not.toHaveBeenCalled();
  });

  it('calls onReconnect when becoming ready while already online after being offline', () => {
    const onReconnect = jest.fn();

    const { rerender } = renderHook<void, HookProps>(
      ({ isOnline, isReady, onReconnect }) =>
        useRefetchOnReconnect({ isOnline, isReady, onReconnect }),
      { initialProps: { isOnline: false, isReady: true, onReconnect } },
    );

    // Go online
    rerender({ isOnline: true, isReady: true, onReconnect });
    expect(onReconnect).toHaveBeenCalledTimes(1);

    // Go offline again
    rerender({ isOnline: false, isReady: true, onReconnect });
    expect(onReconnect).toHaveBeenCalledTimes(1);

    // Come back online again
    rerender({ isOnline: true, isReady: true, onReconnect });
    expect(onReconnect).toHaveBeenCalledTimes(2);
  });

  it('uses the latest onReconnect callback', () => {
    const onReconnect1 = jest.fn();
    const onReconnect2 = jest.fn();

    const { rerender } = renderHook<void, HookProps>(
      ({ isOnline, isReady, onReconnect }) =>
        useRefetchOnReconnect({ isOnline, isReady, onReconnect }),
      {
        initialProps: {
          isOnline: false,
          isReady: true,
          onReconnect: onReconnect1,
        },
      },
    );

    // Update callback before going online
    rerender({ isOnline: false, isReady: true, onReconnect: onReconnect2 });

    // Transition to online - should use the latest callback
    rerender({ isOnline: true, isReady: true, onReconnect: onReconnect2 });

    expect(onReconnect1).not.toHaveBeenCalled();
    expect(onReconnect2).toHaveBeenCalledTimes(1);
  });
});
