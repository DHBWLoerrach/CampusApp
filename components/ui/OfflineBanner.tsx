import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function OfflineBanner({
  title = 'Offline',
  message = 'Inhalte können nicht aktualisiert werden.',
  style,
}: {
  title?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const tintColor = useThemeColor({}, 'tint');
  const bgColor = useThemeColor({}, 'dayNumberContainer');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView
      accessibilityRole="status"
      accessibilityLabel={`${title}. ${message}`}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          borderLeftColor: tintColor,
        },
        style,
      ]}
    >
      <IconSymbol
        name="exclamationmark.triangle"
        size={18}
        color={tintColor}
        style={styles.icon}
      />
      <View style={styles.textWrap}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 10,
  },
  icon: {
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },
});

