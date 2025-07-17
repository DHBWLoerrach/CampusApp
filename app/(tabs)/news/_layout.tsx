import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { dhbwRed } from '@/constants/Colors';

export default function NewsStack() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(top)" />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          presentation: 'modal',
          title: 'News Detail',
          headerBackVisible: false,
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: dhbwRed, fontSize: 16 }}>
                Fertig
              </Text>
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
