import { useEffect, useRef } from 'react';

type RefetchOnReconnectOptions = {
  isOnline: boolean;
  isReady: boolean;
  onReconnect: () => void | Promise<void>;
};

/**
 * Triggers a callback when the device transitions from offline to online.
 * Useful for auto-refreshing data after reconnection.
 *
 * @param isOnline - Current online status
 * @param isReady - Whether the component/data is ready (prevents premature triggers)
 * @param onReconnect - Callback to execute on reconnection
 */
export function useRefetchOnReconnect({
  isOnline,
  isReady,
  onReconnect,
}: RefetchOnReconnectOptions) {
  const prevOnlineRef = useRef<boolean | null>(null);
  // Store callback in ref to avoid dependency on unstable inline functions
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    if (!isReady) return;
    const prevOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    const cameBackOnline = prevOnline === false && isOnline === true;
    if (!cameBackOnline) return;

    void onReconnectRef.current();
  }, [isOnline, isReady]);
}
