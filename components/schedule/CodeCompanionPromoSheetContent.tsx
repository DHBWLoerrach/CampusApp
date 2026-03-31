import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { dhbwRed } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  CODE_COMPANION_ANDROID_URL,
  CODE_COMPANION_FEATURES,
  CODE_COMPANION_IOS_URL,
} from '@/lib/codeCompanionPromo';

interface CodeCompanionPromoSheetContentProps {
  canHideForever: boolean;
  onClose: () => void;
  onHideForever: () => void;
}

const CODE_COMPANION_ICON = require('../../assets/images/codecompanion.png');

export function CodeCompanionPromoSheetTitle() {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.sheetTitleRow}>
      <View
        style={[
          styles.sheetTitleIconFrame,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <Image
          source={CODE_COMPANION_ICON}
          style={styles.sheetTitleIcon}
          accessibilityRole="image"
          accessibilityLabel="App-Icon von DHBW CodeCompanion"
        />
      </View>
      <ThemedText style={styles.sheetTitleText}>DHBW CodeCompanion</ThemedText>
    </View>
  );
}

function PromoBullet({ text }: { text: string }) {
  const textColor = useThemeColor({}, 'text');

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
  const cardBackground = useThemeColor({}, 'dayNumberContainer');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'icon');
  const showAndroidButton = Platform.OS !== 'ios';
  const showIosButton = Platform.OS !== 'android';

  const handleOpenStore = async (url: string) => {
    onClose();

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Failed to open CodeCompanion store URL:', error);
      Alert.alert(
        'Link konnte nicht geöffnet werden',
        'Der Store-Link für CodeCompanion konnte nicht geöffnet werden.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.highlightCard, { backgroundColor: cardBackground }]}>
        <ThemedText style={styles.eyebrow}>DEIN LERNBEGLEITER</ThemedText>
        <ThemedText style={styles.lead}>
          Mit der App CodeCompanion kannst du Programmierthemen üben und
          vertiefen.
        </ThemedText>
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
              Bei Google Play öffnen
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
              Im App Store öffnen
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
            <ThemedText
              style={[styles.dismissButtonText, { color: secondaryTextColor }]}
            >
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
            <ThemedText
              style={[styles.dismissButtonText, { color: secondaryTextColor }]}
            >
              Schließen
            </ThemedText>
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
    flexDirection: 'row',
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
    alignItems: 'center',
    paddingVertical: 2,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eyebrow: {
    alignSelf: 'center',
    color: dhbwRed,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureList: {
    gap: 10,
  },
  highlightCard: {
    borderRadius: 20,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: dhbwRed,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetTitleIcon: {
    borderRadius: 8,
    height: 34,
    width: 34,
  },
  sheetTitleIconFrame: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  sheetTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sheetTitleText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
