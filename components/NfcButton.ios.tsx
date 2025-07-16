import convertBytesToDouble from '@/lib/Nfc_helper';
import { useEffect } from 'react';
import { Button } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function NfcButton() {
  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) NfcManager.start();
    });
  }, []);

  const onPress = async () => {
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
        console.warn('NFC Fehler (iOS):', ex);
      }
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  return <Button title="NFC" onPress={onPress} />;
}
