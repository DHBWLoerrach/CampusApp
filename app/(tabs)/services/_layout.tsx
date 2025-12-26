import { Stack } from 'expo-router';
import { navBarOptions } from '@/constants/Navigation';

export default function Layout() {
  return (
    <Stack screenOptions={navBarOptions}>
      <Stack.Screen name="index" options={{ title: 'Services' }} />
      <Stack.Screen
        name="help-links"
        options={{ title: 'Beratung und Hilfe' }}
      />
      <Stack.Screen name="preferences" options={{ title: 'Einstellungen' }} />
      <Stack.Screen name="safety" options={{ title: 'Sicherheit' }} />
      <Stack.Screen
        name="study-links"
        options={{ title: 'Studium: Weitere Links' }}
      />
    </Stack>
  );
}
