import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import convertBytesToDouble from "@/lib/nfcHelper";
import { useThemeColor } from "@/hooks/useThemeColor";
import NfcTriggerCard from "@/components/canteen/NfcTriggerCard";

type Props = {
  render?: (args: { onPress: () => void; isScanning: boolean }) => ReactNode;
};

export default function NfcButton({ render }: Props) {
  const modalBg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [isScanning, setIsScanning] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

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
        "Guthaben-Info",
        "NFC scheint von deinem Gerät nicht unterstützt zu werden.",
      );
      return;
    }

    let timeoutHandle: number | null = null;
    let timedOut = false;

    try {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsScanning(true);

      timeoutHandle = setTimeout(() => {
        timedOut = true;
        NfcManager.cancelTechnologyRequest().catch(() => {});
      }, 5000);

      await NfcManager.requestTechnology(NfcTech.IsoDep);
      if (timedOut) throw new Error("timeout");

      if (timeoutHandle) clearTimeout(timeoutHandle);

      await NfcManager.transceive([0x5a, 0x5f, 0x84, 0x15]);
      const balanceBytes = await NfcManager.transceive([0x6c, 0x1]);
      const lastTransactionBytes = await NfcManager.transceive([0xf5, 0x1]);

      const { balance, lastTransaction } = convertBytesToDouble(
        balanceBytes,
        lastTransactionBytes,
      );

      setModalMessage(
        `Guthaben: ${balance}€\nLetzte Transaktion: ${lastTransaction}€\n(Angaben ohne Gewähr)`,
      );
    } catch (ex: any) {
      if (timedOut) {
        setModalMessage("Zeitüberschreitung – keine CampusCard erkannt.");
      } else {
        setModalMessage("NFC Fehler – bitte erneut versuchen.");
        console.warn("NFC Fehler (Android):", ex);
      }
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      setIsScanning(false);
      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const handleModalClose = () => setModalMessage(null);

  const trigger = render ? (
    render({ onPress, isScanning })
  ) : (
    <NfcTriggerCard onPress={onPress} />
  );

  return (
    <>
      {trigger}
      <Modal
        visible={isScanning || modalMessage !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: modalBg }]}>
            {modalMessage ? (
              <>
                <Text style={[styles.text, { color: textColor }]}>
                  {modalMessage}
                </Text>
                <View style={{ marginTop: 16 }}>
                  <Button title="OK" onPress={handleModalClose} />
                </View>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color="#007aff" />
                <Text style={[styles.text, { color: textColor }]}>
                  Halte deine CampusCard an das Gerät…
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 260,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  // Card styles are in NfcTriggerCard
});
