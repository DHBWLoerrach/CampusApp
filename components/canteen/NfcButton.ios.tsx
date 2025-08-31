import { ReactNode, useEffect } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import convertBytesToDouble from '@/lib/nfcHelper';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = {
  render?: (args: { onPress: () => void }) => ReactNode;
};

export default function NfcButton({ render }: Props) {
  const iconColor = useThemeColor({}, 'icon');
  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) NfcManager.start();
    });
  }, []);

  const onPress = async () => {
    const isNfcAvailable =
      (await NfcManager.isSupported()) &&
      (await NfcManager.isEnabled());

    if (!isNfcAvailable) {
      Alert.alert(
        'Guthaben-Info',
        'NFC scheint von deinem Gerät nicht unterstützt zu werden.'
      );
      return;
    }

    try {
      await NfcManager.requestTechnology(NfcTech.MifareIOS, {
        alertMessage:
          'Halte deine CampusCard an den oberen Rand deines Handys…',
      });

      await NfcManager.sendMifareCommandIOS([0x5a, 0x5f, 0x84, 0x15]);
      const balanceBytes = await NfcManager.sendMifareCommandIOS([
        0x6c, 0x1,
      ]);
      const lastTransactionBytes =
        await NfcManager.sendMifareCommandIOS([0xf5, 0x1]);

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes
      );

      NfcManager.setAlertMessageIOS(
        `Guthaben: ${balance}€\nLetzte Transaktion: ${lastTransaction}€`
      );
    } catch (ex: any) {
      const isCancelledByUser =
        ex instanceof Error &&
        (!ex.message || ex.message.toLowerCase().includes('cancel'));

      if (!isCancelledByUser) {
        Alert.alert(
          'Fehler',
          'Beim Auslesen deiner Karte ist ein Problem aufgetreten.'
        );
        console.warn('NFC Fehler (iOS):', ex);
      }
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  if (render) return <>{render({ onPress })}</>;

  return (
    <ThemedView
      style={[styles.balanceCard, styles.elevated]}
      lightColor="#fff"
      darkColor="#222"
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Guthaben der CampusCard abfragen"
        style={styles.balanceRow}
        hitSlop={8}
      >
        <IconSymbol
          name="wallet.bifold"
          size={18}
          color={iconColor}
        />
        <ThemedText style={styles.balanceTitle}>
          Guthaben der CampusCard abfragen
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 12,
    padding: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  elevated: {
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
