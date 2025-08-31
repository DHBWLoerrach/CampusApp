import { Pressable, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = { onPress: () => void };

export default function NfcTriggerCard({ onPress }: Props) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView
      style={[styles.card, styles.elevated]}
      lightColor="#fff"
      darkColor="#222"
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Guthaben der CampusCard abfragen"
        style={styles.row}
        hitSlop={8}
      >
        <IconSymbol
          name="wallet.bifold"
          size={18}
          color={iconColor}
        />
        <ThemedText style={styles.title}>
          Guthaben der CampusCard abfragen
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
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
