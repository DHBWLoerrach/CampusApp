import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';

export default function EmptyState({
  icon,
  title,
  message,
  children,
  style,
}: {
  icon: IconSymbolName;
  title: string;
  message?: string;
  /** Optional actions rendered below the message. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.center}>
        <IconSymbol
          name={icon}
          size={28}
          color={tintColor}
          style={styles.icon}
        />
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {message ? (
          <ThemedText style={styles.message}>{message}</ThemedText>
        ) : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
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
});
