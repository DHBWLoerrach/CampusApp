import { Linking, Platform, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import EmptyState from '@/components/ui/EmptyState';

export default function OfflineEmptyState({
  title = 'Keine Internetverbindung',
  message = 'Inhalte können ohne Internetverbindung nicht geladen werden.',
  onOpenSettings = Platform.OS === 'web'
    ? undefined
    : () => {
        void Linking.openSettings();
      },
  onRetry,
  style,
}: {
  title?: string;
  message?: string;
  onOpenSettings?: () => void;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <EmptyState
      icon="exclamationmark.triangle"
      title={title}
      message={message}
      style={style}
    >
      {onOpenSettings ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Internet-Einstellungen öffnen"
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.button,
            { borderColor: tintColor },
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <ThemedText style={[styles.buttonText, { color: tintColor }]}>
            Einstellungen öffnen
          </ThemedText>
        </Pressable>
      ) : null}

      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Erneut versuchen"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            { borderColor },
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <ThemedText style={styles.buttonText}>Erneut versuchen</ThemedText>
        </Pressable>
      ) : null}
    </EmptyState>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
