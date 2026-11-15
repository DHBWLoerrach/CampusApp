import { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import ClockIcon from '@expo/material-symbols/schedule.xml';
import BottomSheet from '@/components/ui/BottomSheet';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  NAV_HEADER_TITLE_FONT_SIZE,
  NAV_HEADER_TITLE_FONT_WEIGHT,
  navBarOptions,
} from '@/constants/Navigation';
import { useThemeColor } from '@/hooks/useThemeColor';

const CANTEEN_INFO_LABEL = 'Mensa-Informationen anzeigen';
const CANTEEN_INFO_HINT = 'Blendet Infos zur Mensa Campus Hangstraße ein';
const CANTEEN_NAME = 'Mensa Hangstraße';
// The root tab already says "Mensa", and the full name does not fit the
// leading toolbar on iPad mini, which moves it into an overflow menu.
const CANTEEN_SHORT_NAME = 'Hangstraße';

export default function CanteenStackLayout() {
  const [canteenInfoOpen, setCanteenInfoOpen] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const isIpad = Platform.OS === 'ios' && Platform.isPad;

  return (
    <>
      <Stack screenOptions={navBarOptions}>
        <Stack.Screen name="(sections)" options={{ title: 'Mensa' }}>
          {/* iPadOS shows the root tabs in the top bar and hides the
              navigation title, which would leave the info button alone in its
              row. The canteen name fills the leading side instead. */}
          {isIpad ? (
            <Stack.Toolbar placement="left">
              <Stack.Toolbar.View hidesSharedBackground>
                <Text
                  accessibilityRole="header"
                  numberOfLines={1}
                  style={{
                    color: textColor,
                    fontSize: NAV_HEADER_TITLE_FONT_SIZE,
                    fontWeight: NAV_HEADER_TITLE_FONT_WEIGHT,
                  }}
                >
                  {CANTEEN_SHORT_NAME}
                </Text>
              </Stack.Toolbar.View>
            </Stack.Toolbar>
          ) : null}
          {/* A native bar button item. iOS drops custom header views when it
              moves the header items into the side column of a folded iPhone
              Duo, which would leave no way to open the canteen info. Android
              takes Material Symbols as image sources. */}
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon={Platform.OS === 'ios' ? 'clock' : ClockIcon}
              tintColor={tintColor}
              onPress={() => setCanteenInfoOpen(true)}
              accessibilityLabel={CANTEEN_INFO_LABEL}
              accessibilityHint={CANTEEN_INFO_HINT}
            />
          </Stack.Toolbar>
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
        title={CANTEEN_NAME}
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
