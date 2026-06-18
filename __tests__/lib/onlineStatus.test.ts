import { resolveOnlineStatus } from '@/lib/onlineStatus';

describe('resolveOnlineStatus', () => {
  it('prefers internet reachability over connection state', () => {
    expect(
      resolveOnlineStatus({
        isInternetReachable: false,
        isConnected: true,
      })
    ).toBe(false);
  });

  it('falls back to connection state while reachability is unknown', () => {
    expect(
      resolveOnlineStatus({
        isInternetReachable: null,
        isConnected: false,
      })
    ).toBe(false);
  });

  it('defaults to online while NetInfo state is still unknown', () => {
    expect(
      resolveOnlineStatus({
        isInternetReachable: null,
        isConnected: null,
      })
    ).toBe(true);
  });
});
