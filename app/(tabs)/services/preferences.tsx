import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import RoleSelection from '@/components/services/RoleSelection';
import { dhbwRed } from '@/constants/Colors';
import { useColorSchemeOverride } from '@/context/ColorSchemeContext';
import { useRoleContext } from '@/context/RoleContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function PreferencesScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { alwaysDark, setAlwaysDark, isReady } = useColorSchemeOverride();
  const { selectedRole, setSelectedRole } = useRoleContext();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <ThemedView style={styles.content}>
          {/* Card: Dark Mode preference */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedText style={styles.cardTitle}>Darstellung</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Bei Aktivierung wird die Systemeinstellung ignoriert und die App
              immer dunkel angezeigt.
            </ThemedText>
            <View style={styles.row}>
              <ThemedText style={styles.label}>
                App stets im Dark Mode
              </ThemedText>
              <Switch
                value={alwaysDark}
                onValueChange={setAlwaysDark}
                disabled={!isReady}
                thumbColor={alwaysDark ? dhbwRed : undefined}
                trackColor={{ false: '#767577', true: '#cfd2d4' }}
              />
            </View>
          </ThemedView>

          {/* Card: Mensa price group */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedText style={styles.cardTitle}>Mensa-Preisgruppe</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Bestimmt die Preisgruppe für die Mensa.
            </ThemedText>
            <RoleSelection
              role={selectedRole}
              onRoleChange={(r) => setSelectedRole(r)}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  // Card base style used to visually separate settings
  card: {
    borderRadius: 12,
    borderCurve: 'continuous',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
});
