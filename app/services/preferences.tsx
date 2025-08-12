import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Colors, dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PreferencesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.introText}>
          Hier kannst du manuell den Dark Mode der App aktivieren.
          Dafür muss die Verwendung der Systemeinstellung deaktiviert
          werden.
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
});
