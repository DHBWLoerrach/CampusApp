const mockAddEventListener = jest.fn();
const mockSetEventListener = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
}));

jest.mock('@tanstack/react-query', () => ({
  onlineManager: {
    setEventListener: (...args: unknown[]) => mockSetEventListener(...args),
  },
}));

describe('configureQueryOnlineManager', () => {
  beforeEach(() => {
    jest.resetModules();
    mockAddEventListener.mockReset();
    mockSetEventListener.mockReset();
  });

  it('forwards NetInfo reachability changes to React Query', () => {
    const unsubscribe = jest.fn();
    mockAddEventListener.mockReturnValue(unsubscribe);
    const { configureQueryOnlineManager } = require('@/lib/queryOnlineManager');

    configureQueryOnlineManager();

    expect(mockSetEventListener).toHaveBeenCalledTimes(1);
    const subscribe = mockSetEventListener.mock.calls[0][0];
    const setOnline = jest.fn();

    expect(subscribe(setOnline)).toBe(unsubscribe);
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);

    const netInfoListener = mockAddEventListener.mock.calls[0][0];
    netInfoListener({ isInternetReachable: false, isConnected: true });
    netInfoListener({ isInternetReachable: null, isConnected: false });
    netInfoListener({ isInternetReachable: null, isConnected: null });

    expect(setOnline).toHaveBeenNthCalledWith(1, false);
    expect(setOnline).toHaveBeenNthCalledWith(2, false);
    expect(setOnline).toHaveBeenNthCalledWith(3, true);
  });

  it('configures the React Query online manager only once', () => {
    const { configureQueryOnlineManager } = require('@/lib/queryOnlineManager');

    configureQueryOnlineManager();
    configureQueryOnlineManager();

    expect(mockSetEventListener).toHaveBeenCalledTimes(1);
  });
});
