import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = { onPress: () => void };

export default function NfcTriggerCard({ onPress }: Props) {
  const backgroundColor = useThemeColor(
    { light: '#fff', dark: '#222' },
    'background'
  );
  const borderColor = useThemeColor(
    { light: 'rgba(92, 105, 113, 0.28)', dark: 'rgba(218, 218, 218, 0.22)' },
    'border'
  );
  const iconColor = useThemeColor({}, 'tint');
  const chevronColor = useThemeColor({}, 'icon');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="CampusCard-Guthaben prüfen"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor, borderColor, opacity: pressed ? 0.72 : 1 },
      ]}
      hitSlop={8}
    >
      <IconSymbol name="wallet.bifold" size={19} color={iconColor} />
      <ThemedText style={styles.title} numberOfLines={1}>
        CampusCard-Guthaben prüfen
      </ThemedText>
      <IconSymbol
        name="chevron.right"
        size={15}
        color={chevronColor}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 42,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
