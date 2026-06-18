import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { resolveOnlineStatus } from '@/lib/onlineStatus';

let isConfigured = false;

export function configureQueryOnlineManager(): void {
  if (isConfigured) return;
  isConfigured = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(resolveOnlineStatus(state));
    })
  );
}
