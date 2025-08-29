import { StyleSheet, Switch, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import RoleSelection from '@/components/services/RoleSelection';
import { dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { useColorSchemeOverride } from '@/context/ColorSchemeContext';
import { useRoleContext } from '@/context/RoleContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function PreferencesScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { alwaysDark, setAlwaysDark, isReady } =
    useColorSchemeOverride();
  const { selectedRole, setSelectedRole } = useRoleContext();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Einstellungen',
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <ThemedView style={styles.content}>
        {/* Card: Dark Mode preference */}
        <ThemedView style={[styles.card, { borderColor }]}>
          <ThemedText style={styles.cardTitle}>
            Darstellung
          </ThemedText>
          <ThemedText style={styles.cardDescription}>
            Bei Aktivierung wird die Systemeinstellung ignoriert und
            die App immer dunkel angezeigt.
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
          <ThemedText style={styles.cardTitle}>
            Mensa-Preisgruppe
          </ThemedText>
          <ThemedText style={styles.cardDescription}>
            Bestimmt die Preisgruppe für die Mensa.
          </ThemedText>
          <RoleSelection
            role={selectedRole}
            onRoleChange={(r) => setSelectedRole(r)}
          />
        </ThemedView>
      </ThemedView>
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
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    // Subtle shadow for iOS and elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
});
