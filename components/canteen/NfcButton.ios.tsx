import { ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import convertBytesToDouble from '@/lib/nfcHelper';
import NfcTriggerCard from '@/components/canteen/NfcTriggerCard';

type Props = {
  render?: (args: { onPress: () => void }) => ReactNode;
};

export default function NfcButton({ render }: Props) {
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
        `Guthaben: ${balance}€ — Letzte Transaktion: ${lastTransaction}€\n(Angaben ohne Gewähr)`
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

  return <NfcTriggerCard onPress={onPress} />;
}
