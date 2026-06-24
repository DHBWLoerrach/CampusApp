import { ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import NfcManager from 'react-native-nfc-manager';
import NfcTriggerCard from '@/components/canteen/NfcTriggerCard';

type Props = {
  render?: (args: { onPress: () => void; isScanning: boolean }) => ReactNode;
};

export default function NfcButton({ render }: Props) {
  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) NfcManager.start();
    });
  }, []);

  const onPress = async () => {
    const isNfcAvailable =
      (await NfcManager.isSupported()) && (await NfcManager.isEnabled());

    if (!isNfcAvailable) {
      Alert.alert(
        'Guthaben-Info',
        'NFC scheint von deinem Gerät nicht unterstützt zu werden.'
      );
      return;
    }

    router.push('/canteen/nfc-sheet');
  };

  if (render) return <>{render({ onPress, isScanning: false })}</>;

  return <NfcTriggerCard onPress={onPress} />;
}
