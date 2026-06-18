import type { NetInfoState } from '@react-native-community/netinfo';

/**
 * NetInfo can report reachability as null initially. Until we have a definitive
 * signal, treat connectivity as online so the UI does not flash offline states.
 */
export function resolveOnlineStatus(
  state: Pick<NetInfoState, 'isInternetReachable' | 'isConnected'>
): boolean {
  return state.isInternetReachable ?? state.isConnected ?? true;
}
