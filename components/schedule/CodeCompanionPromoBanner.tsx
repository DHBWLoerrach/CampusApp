import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

const CODE_COMPANION_ICON = require('../../assets/images/codecompanion.png');

interface CodeCompanionPromoBannerProps {
  onPress: () => void;
}

export default function CodeCompanionPromoBanner({
  onPress,
}: CodeCompanionPromoBannerProps) {
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="DHBW Code Companion öffnen"
      accessibilityHint="Öffnet den Hinweis zu DHBW Code Companion"
      style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
    >
      <View style={[styles.iconFrame, { backgroundColor: cardBackground, borderColor }]}>
        <Image
          source={CODE_COMPANION_ICON}
          style={styles.icon}
          accessibilityRole="image"
          accessibilityLabel="App-Icon von DHBW Code Companion"
        />
      </View>

      <View style={styles.texts}>
        <ThemedText style={styles.title}>DHBW Code Companion</ThemedText>
        <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
          Quizfragen · Lernpfade · Lernfortschritt
        </ThemedText>
      </View>

      <IconSymbol name="chevron.right" size={18} color={secondaryTextColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  iconFrame: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
