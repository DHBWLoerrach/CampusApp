import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { dhbwRed } from "@/constants/Colors";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  CODE_COMPANION_ANDROID_URL,
  CODE_COMPANION_FEATURES,
  CODE_COMPANION_IOS_URL,
} from "@/lib/codeCompanionPromo";

interface CodeCompanionPromoSheetContentProps {
  canHideForever: boolean;
  onClose: () => void;
  onHideForever: () => void;
}

const CODE_COMPANION_ICON = require("../../assets/images/codecompanion.png");

function PromoBullet({ text }: { text: string }) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <ThemedText style={[styles.bulletText, { color: textColor }]}>
        {text}
      </ThemedText>
    </View>
  );
}

export default function CodeCompanionPromoSheetContent({
  canHideForever,
  onClose,
  onHideForever,
}: CodeCompanionPromoSheetContentProps) {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const cardBackground = useThemeColor({}, "dayNumberContainer");
  const showAndroidButton = Platform.OS !== "ios";
  const showIosButton = Platform.OS !== "android";

  const handleOpenStore = async (url: string) => {
    onClose();

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Failed to open CodeCompanion store URL:", error);
      Alert.alert(
        "Link konnte nicht geöffnet werden",
        "Der Store-Link für CodeCompanion konnte nicht geöffnet werden.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.highlightCard, { backgroundColor: cardBackground }]}>
        <View style={styles.heroRow}>
          <View
            style={[
              styles.iconFrame,
              {
                backgroundColor,
                borderColor,
              },
            ]}
          >
            <Image
              source={CODE_COMPANION_ICON}
              style={styles.icon}
              accessibilityRole="image"
              accessibilityLabel="App-Icon von DHBW CodeCompanion"
            />
          </View>
          <View style={styles.heroText}>
            <ThemedText style={styles.eyebrow}>KOSTENLOSES LERNANGEBOT</ThemedText>
            <ThemedText style={styles.lead}>
              DHBW CodeCompanion ist ein kostenloses Lernangebot der DHBW zum
              Lernen und Üben von JavaScript, Python und Java.
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.featureList}>
        {CODE_COMPANION_FEATURES.map((feature) => (
          <PromoBullet key={feature} text={feature} />
        ))}
      </View>

      <View style={styles.actions}>
        {showAndroidButton ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              void handleOpenStore(CODE_COMPANION_ANDROID_URL);
            }}
            accessibilityRole="button"
            accessibilityLabel="CodeCompanion für Android öffnen"
            accessibilityHint="Öffnet die Android-App von CodeCompanion"
          >
            <ThemedText style={styles.primaryButtonText}>
              Bei Google Play ansehen
            </ThemedText>
          </TouchableOpacity>
        ) : null}

        {showIosButton ? (
          <TouchableOpacity
            style={[
              showAndroidButton ? styles.secondaryButton : styles.primaryButton,
              showAndroidButton ? { borderColor } : null,
            ]}
            onPress={() => {
              void handleOpenStore(CODE_COMPANION_IOS_URL);
            }}
            accessibilityRole="button"
            accessibilityLabel="CodeCompanion für iOS öffnen"
            accessibilityHint="Öffnet CodeCompanion im App Store"
          >
            <ThemedText
              style={
                showAndroidButton
                  ? styles.secondaryButtonText
                  : styles.primaryButtonText
              }
            >
              Im App Store ansehen
            </ThemedText>
          </TouchableOpacity>
        ) : null}

        {canHideForever ? (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onHideForever}
            accessibilityRole="button"
            accessibilityLabel="CodeCompanion-Hinweis nicht mehr automatisch anzeigen"
            accessibilityHint="Blendet diesen Hinweis dauerhaft aus"
          >
            <ThemedText style={styles.dismissButtonText}>
              Nicht mehr automatisch anzeigen
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="CodeCompanion-Hinweis schließen"
            accessibilityHint="Schließt diesen Hinweis"
          >
            <ThemedText style={styles.dismissButtonText}>Schließen</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    marginTop: 18,
  },
  bulletDot: {
    backgroundColor: dhbwRed,
    borderRadius: 4,
    height: 8,
    marginTop: 7,
    width: 8,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 12,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  container: {
    paddingBottom: 4,
  },
  dismissButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  dismissButtonText: {
    color: dhbwRed,
    fontSize: 15,
    fontWeight: "600",
  },
  eyebrow: {
    color: dhbwRed,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  featureList: {
    gap: 10,
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  heroText: {
    flex: 1,
    flexShrink: 1,
  },
  highlightCard: {
    borderRadius: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  icon: {
    borderRadius: 16,
    height: 64,
    width: 64,
  },
  iconFrame: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 4,
  },
  lead: {
    fontSize: 17,
    lineHeight: 25,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: dhbwRed,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
