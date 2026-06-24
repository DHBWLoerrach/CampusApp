import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import convertBytesToDouble from '@/lib/nfcHelper';
import { useThemeColor } from '@/hooks/useThemeColor';

type ScanState =
  | { status: 'scanning' }
  | { status: 'result'; message: string }
  | { status: 'error'; message: string };

export default function NfcSheetScreen() {
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScanState>({ status: 'scanning' });

  useEffect(() => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;
    let cancelled = false;

    const scan = async () => {
      try {
        await NfcManager.cancelTechnologyRequest().catch(() => {});

        timeoutHandle = setTimeout(() => {
          timedOut = true;
          NfcManager.cancelTechnologyRequest().catch(() => {});
        }, 5000);

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        if (timedOut) throw new Error('timeout');
        if (timeoutHandle) clearTimeout(timeoutHandle);

        await NfcManager.transceive([0x5a, 0x5f, 0x84, 0x15]);
        const balanceBytes = await NfcManager.transceive([0x6c, 0x1]);
        const lastTransactionBytes = await NfcManager.transceive([0xf5, 0x1]);

        const { balance, lastTransaction } = convertBytesToDouble(
          balanceBytes,
          lastTransactionBytes
        );

        if (cancelled) return;
        setState({
          status: 'result',
          message: `Guthaben: ${balance}€\nLetzte Transaktion: ${lastTransaction}€\n(Angaben ohne Gewähr)`,
        });
      } catch (ex: any) {
        if (cancelled) return;
        if (timedOut) {
          setState({
            status: 'error',
            message: 'Zeitüberschreitung – keine CampusCard erkannt.',
          });
        } else {
          setState({
            status: 'error',
            message: 'NFC Fehler – bitte erneut versuchen.',
          });
          console.warn('NFC Fehler (Android):', ex);
        }
      }
    };

    scan();

    // Cleanup on unmount (swipe-dismiss, hardware back, or "Fertig" button)
    return () => {
      cancelled = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: background,
          paddingBottom: Math.max(16, insets.bottom + 12),
        },
      ]}
    >
      {state.status === 'scanning' ? (
        <>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.text, { color: textColor }]}>
            Halte deine CampusCard an das Gerät…
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.text, { color: textColor }]} selectable>
            {state.message}
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Sheet schließen"
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>Fertig</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
