import { StyleSheet, View, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorSchemeOverride } from '@/context/ColorSchemeContext';

export default function PreferencesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { alwaysDark, setAlwaysDark, isReady } =
    useColorSchemeOverride();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' },
      ]}
    >
      <Stack.Screen
        options={{
          title: 'Einstellungen',
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.introText}>
          Manuell den Dark Mode aktivieren. Bei Aktivierung wird die
          Systemeinstellung ignoriert und die App immer dunkel
          angezeigt.
        </ThemedText>

        <View style={styles.row}>
          <ThemedText style={styles.label}>
            App immer im Dark Mode ausführen
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
  },
});
