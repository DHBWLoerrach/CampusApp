import { Button, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ErrorWithReloadButton({
  error,
  message,
  isFetching,
  refetch,
}: {
  error: Error;
  message?: string;
  isFetching: boolean;
  refetch: () => void;
}) {
  const tintColor = useThemeColor({}, 'tint');
  const errorMessage =
    message?.trim() ||
    error.message.trim() ||
    'Bitte versuchen Sie es später erneut.';

  return (
    <ThemedView style={styles.center}>
      <ThemedText style={[styles.errorText, { color: tintColor }]}>
        Ein Fehler ist aufgetreten:
      </ThemedText>
      <ThemedText style={[styles.errorText, { color: tintColor }]}>
        {errorMessage}
      </ThemedText>
      <View style={{ marginTop: 12 }}>
        <Button
          title={isFetching ? 'Wird neu geladen…' : 'Neu laden'}
          onPress={() => refetch()}
          color={tintColor}
          disabled={isFetching}
          accessibilityLabel="Erneut laden"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    margin: 10,
  },
});
