import { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { navBarOptions } from '@/constants/Navigation';
import { useThemeColor } from '@/hooks/useThemeColor';

const CANTEEN_INFO_LABEL = 'Mensa-Informationen anzeigen';
const CANTEEN_INFO_HINT = 'Blendet Infos zur Mensa Campus Hangstraße ein';

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
            // Android toolbar buttons only take image icons, so Android keeps
            // the custom header view.
            headerRight:
              Platform.OS === 'ios'
                ? undefined
                : () => (
                    <HeaderIconButton
                      onPress={() => setCanteenInfoOpen(true)}
                      name="clock"
                      color={tintColor}
                      accessibilityLabel={CANTEEN_INFO_LABEL}
                      accessibilityHint={CANTEEN_INFO_HINT}
                    />
                  ),
          }}
        >
          {/* A native bar button item: iOS drops custom header views when it
              moves the header items into the side column of a folded iPhone
              Duo, which would leave no way to open the canteen info. */}
          {Platform.OS === 'ios' ? (
            <Stack.Toolbar placement="right">
              <Stack.Toolbar.Button
                icon="clock"
                tintColor={tintColor}
                onPress={() => setCanteenInfoOpen(true)}
                accessibilityLabel={CANTEEN_INFO_LABEL}
                accessibilityHint={CANTEEN_INFO_HINT}
              />
            </Stack.Toolbar>
          ) : null}
        </Stack.Screen>
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
