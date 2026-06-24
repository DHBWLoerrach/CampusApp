import { useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { navBarOptions } from '@/constants/Navigation';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function CanteenStackLayout() {
  const [canteenInfoOpen, setCanteenInfoOpen] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <>
      <Stack screenOptions={navBarOptions}>
        <Stack.Screen
          name="(sections)"
          options={{
            title: 'Mensa',
            headerRight: () => (
              <HeaderIconButton
                onPress={() => setCanteenInfoOpen(true)}
                name="clock"
                color={tintColor}
                accessibilityLabel="Mensa-Informationen anzeigen"
                accessibilityHint="Blendet Infos zur Mensa Campus Hangstraße ein"
              />
            ),
          }}
        />
        <Stack.Screen
          name="nfc-sheet"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.3],
            sheetGrabberVisible: true,
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
      <BottomSheet
        visible={canteenInfoOpen}
        title="Mensa Hangstraße"
        onClose={() => setCanteenInfoOpen(false)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 24,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <IconSymbol name="clock" size={20} color={textColor} />
          </View>
          <ThemedText accessibilityLabel="Öffnungszeiten: Montag bis Freitag neun Uhr dreißig bis dreizehn Uhr fünfundvierzig">
            Mo–Fr 9:30–13:45
          </ThemedText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 24,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <IconSymbol name="fork.knife" size={20} color={textColor} />
          </View>
          <ThemedText accessibilityLabel="Essensausgabe: elf Uhr fünfundvierzig bis dreizehn Uhr dreißig">
            Ausgabe 11:45–13:30
          </ThemedText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 24,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <IconSymbol name="eurosign" size={20} color={textColor} />
          </View>
          <ThemedText style={{ flexShrink: 1 }}>
            Preise je nach Personengruppe – ändern unter{' '}
            <ThemedText style={{ fontStyle: 'italic' }}>
              Services &gt; Einstellungen
            </ThemedText>
            .
          </ThemedText>
        </View>
      </BottomSheet>
    </>
  );
}
