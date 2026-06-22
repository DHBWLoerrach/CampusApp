# Native Tabs Decision

CampusApp uses `expo-router/unstable-native-tabs` for the root iOS and Android tab bar on Expo SDK 56.

This is a deliberate native-platform navigation choice: the root tabs use platform tab implementations, DHBW red is kept as the shared `tintColor`, and tab headers are owned by each tab-local stack. Web is intentionally outside this navigation migration.
