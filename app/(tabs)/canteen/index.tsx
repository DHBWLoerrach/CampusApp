import { Platform, StyleSheet } from 'react-native';

import NfcButton from '@/components/canteen/NfcButton';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function CanteenScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="defaultSemiBold"
          style={{ fontSize: 18, textAlign: 'center' }}
        >
          Die Mensa ist bis einschließlich 14.09.25 geschlossen.
        </ThemedText>
      </ThemedView>
      {['android', 'ios'].includes(Platform.OS) && <NfcButton />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
