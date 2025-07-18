import { Stack, useRouter } from 'expo-router';
import { Platform, Pressable, Text } from 'react-native';
import { dhbwRed } from '@/constants/Colors';

export default function NewsStack() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="(top)" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          presentation: 'modal',
          title: 'Beitrag ansehen',
          headerBackVisible: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              accessibilityRole="button"
              accessibilityLabel="Modal schließen"
            >
              <Text style={{ color: dhbwRed, fontSize: 18 }}>
                {Platform.OS === 'android' ? 'FERTIG' : 'Fertig'}
              </Text>
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
