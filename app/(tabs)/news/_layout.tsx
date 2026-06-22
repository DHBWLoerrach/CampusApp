import { Stack } from 'expo-router';
import { navBarOptions } from '@/constants/Navigation';

export default function NewsStackLayout() {
  return (
    <Stack screenOptions={navBarOptions}>
      <Stack.Screen name="(sections)" options={{ title: 'DHBW Lörrach' }} />
    </Stack>
  );
}
