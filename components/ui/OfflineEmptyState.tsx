import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function OfflineEmptyState({
  title = 'Keine Internetverbindung',
  message = 'Inhalte können ohne Internetverbindung nicht geladen werden.',
  onOpenSettings,
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
    <ThemedView style={[styles.container, style]}>
      <View style={styles.center}>
        <IconSymbol
          name="exclamationmark.triangle"
          size={28}
          color={tintColor}
          style={styles.icon}
        />
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>

        <View style={styles.actions}>
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
              <ThemedText
                style={[styles.buttonText, { color: tintColor }]}
              >
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
              <ThemedText style={styles.buttonText}>
                Erneut versuchen
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 18,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
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
