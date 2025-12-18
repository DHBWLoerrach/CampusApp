import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

type OnlineStatus = {
  isOnline: boolean;
  isOffline: boolean;
  isReady: boolean;
};

/**
 * Track the device connectivity status (best-effort).
 *
 * Notes:
 * - NetInfo can report `isInternetReachable` as `null` initially; we treat that
 *   as "unknown" and default to online until we have a definitive signal.
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isInternetReachable ?? state.isConnected ?? true;
      setIsOnline(online);
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  return { isOnline, isOffline: !isOnline, isReady };
}

