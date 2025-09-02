import { TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { IconSymbol } from '@/components/ui/IconSymbol';
import BottomSheet from '@/components/ui/BottomSheet';
import { ThemedText } from '@/components/ui/ThemedText';
import RideMatchSheetContent from '@/components/schedule/RideMatchSheetContent';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  CourseProvider,
  useCourseContext,
} from '@/context/CourseContext';
import { LAST_TAB_KEY } from '@/constants/StorageKeys';
import { navBarOptions } from '@/constants/Navigation';
const ICON_SIZE = 28;

function TabsContent() {
  const [canteenInfoOpen, setCanteenInfoOpen] = useState(false);
  const [carpoolOpen, setCarpoolOpen] = useState(false);
  const { selectedCourse, setSelectedCourse } = useCourseContext();
  const textColor = useThemeColor({}, 'text');

  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Vorlesungsplan';

  const handleChangeCourse = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  return (
    <>
      <Tabs screenOptions={navBarOptions}>
        <Tabs.Screen
          name="news"
          options={{
            title: 'DHBW Lörrach',
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={ICON_SIZE}
                name="house"
                color={color}
              />
            ),
            tabBarLabel: 'DHBW',
          }}
          listeners={{
            focus: () => {
              // Persist last active tab for next launch
              Storage.setItem(LAST_TAB_KEY, 'news').catch(() => {});
            },
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: scheduleTitle,
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={ICON_SIZE}
                name="calendar"
                color={color}
              />
            ),
            headerLeft: selectedCourse
              ? () => (
                  <TouchableOpacity
                    onPress={() => setCarpoolOpen(true)}
                    hitSlop={8}
                    style={{ marginLeft: 16 }}
                    accessibilityRole="button"
                    accessibilityLabel="Carpool öffnen"
                    accessibilityHint="Öffnet Carpool-Informationen"
                  >
                    <IconSymbol size={20} name="car" color="white" />
                  </TouchableOpacity>
                )
              : undefined,
            headerRight: selectedCourse
              ? () => (
                  <TouchableOpacity
                    onPress={handleChangeCourse}
                    hitSlop={8}
                    style={{ marginRight: 16 }}
                    accessibilityRole="button"
                    accessibilityLabel="Kurs bearbeiten"
                    accessibilityHint="Öffnet den Bearbeitungsbildschirm für diesen Kurs"
                  >
                    <IconSymbol
                      size={20}
                      name="rectangle.stack"
                      color="white"
                    />
                  </TouchableOpacity>
                )
              : undefined,
          }}
          listeners={{
            focus: () => {
              Storage.setItem(LAST_TAB_KEY, 'schedule').catch(
                () => {}
              );
            },
          }}
        />
        <Tabs.Screen
          name="canteen"
          options={{
            title: 'Mensa',
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={ICON_SIZE}
                name="fork.knife"
                color={color}
              />
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setCanteenInfoOpen(true)}
                hitSlop={8}
                style={{ marginRight: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Mensa-Informationen anzeigen"
                accessibilityHint="Blendet Infos zur Mensa Campus Hangstraße ein"
              >
                <IconSymbol size={20} name="clock" color="white" />
              </TouchableOpacity>
            ),
          }}
          listeners={{
            focus: () => {
              Storage.setItem(LAST_TAB_KEY, 'canteen').catch(
                () => {}
              );
            },
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={ICON_SIZE}
                name="info.circle"
                color={color}
              />
            ),
          }}
          listeners={{
            focus: () => {
              Storage.setItem(LAST_TAB_KEY, 'services').catch(
                () => {}
              );
            },
          }}
        />
      </Tabs>
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
            <IconSymbol
              name="fork.knife"
              size={20}
              color={textColor}
            />
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
          <ThemedText>
            Preise je nach Personengruppe – ändern unter{' '}
            <ThemedText style={{ fontStyle: 'italic' }}>
              Services &gt; Einstellungen
            </ThemedText>
            .
          </ThemedText>
        </View>
      </BottomSheet>
      <BottomSheet
        visible={carpoolOpen}
        title="Mitfahr-Matches"
        onClose={() => setCarpoolOpen(false)}
      >
        <RideMatchSheetContent myCourse={selectedCourse ?? ''} />
      </BottomSheet>
    </>
  );
}

export default function TabLayout() {
  return (
    <CourseProvider>
      <TabsContent />
    </CourseProvider>
  );
}
