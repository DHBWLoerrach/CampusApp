import { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Tabs } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  CourseProvider,
  useCourseContext,
} from '@/context/CourseContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import BottomSheet from '@/components/ui/BottomSheet';
import { ThemedText } from '@/components/ui/ThemedText';
import RideMatchSheetContent from '@/components/schedule/RideMatchSheetContent';
import { LAST_TAB_KEY } from '@/constants/StorageKeys';
import { navBarOptions } from '@/constants/Navigation';
import { RIDES_FEATURE_ENABLED } from '@/constants/FeatureFlags';
const ICON_SIZE = 28;

// Provide React Query at the tabs level so shared features (e.g., rides sheet)
// can use hooks with caching independent of schedule/canteen sub-layouts.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Conservative defaults; hooks override where needed.
      staleTime: 1000 * 60 * 30, // 30 mins
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: false,
    },
  },
});

function TabsContent() {
  const [canteenInfoOpen, setCanteenInfoOpen] = useState(false);
  const [carpoolOpen, setCarpoolOpen] = useState(false);
  const [courseSwitchOpen, setCourseSwitchOpen] = useState(false);
  const { selectedCourse, setSelectedCourse, previousCourses } =
    useCourseContext();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Vorlesungsplan';

  const handleChangeCourse = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  const otherCourses = useMemo(
    () =>
      (previousCourses || []).filter(
        (c) =>
          !!c &&
          c.toUpperCase() !== (selectedCourse || '').toUpperCase()
      ),
    [previousCourses, selectedCourse]
  );

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
            headerTitle: selectedCourse
              ? () => (
                  <TouchableOpacity
                    onPress={() =>
                      otherCourses.length
                        ? setCourseSwitchOpen(true)
                        : handleChangeCourse()
                    }
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      otherCourses.length
                        ? 'Kurs schnell wechseln'
                        : 'Kurs wechseln'
                    }
                    accessibilityHint="Öffnet den Kurswechsel"
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <ThemedText
                        style={{
                          color: 'white',
                          fontWeight: '700',
                          marginRight: 6,
                        }}
                      >
                        {scheduleTitle}
                      </ThemedText>
                      <IconSymbol
                        name="chevron.down"
                        size={14}
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>
                )
              : undefined,
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={ICON_SIZE}
                name="calendar"
                color={color}
              />
            ),
            headerRight:
              selectedCourse && RIDES_FEATURE_ENABLED
                ? () => (
                    <TouchableOpacity
                      onPress={() => setCarpoolOpen(true)}
                      hitSlop={8}
                      style={{ marginRight: 16 }}
                      accessibilityRole="button"
                      accessibilityLabel="Carpool öffnen"
                      accessibilityHint="Öffnet Carpool-Informationen"
                    >
                      <IconSymbol
                        size={20}
                        name="car"
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
          {/* flexShrink text cut-off on right side */}
          <ThemedText style={{ flexShrink: 1 }}>
            Preise je nach Personengruppe – ändern unter{' '}
            <ThemedText style={{ fontStyle: 'italic' }}>
              Services &gt; Einstellungen
            </ThemedText>
            .
          </ThemedText>
        </View>
      </BottomSheet>
      {RIDES_FEATURE_ENABLED && (
        <BottomSheet
          visible={carpoolOpen}
          title="Mitfahr-Matches (nächste 5 Tage)"
          onClose={() => setCarpoolOpen(false)}
        >
          <RideMatchSheetContent myCourse={selectedCourse ?? ''} />
        </BottomSheet>
      )}
      <BottomSheet
        visible={courseSwitchOpen}
        title="Kurs wechseln"
        onClose={() => setCourseSwitchOpen(false)}
      >
        <View style={{ gap: 8 }}>
          {otherCourses.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>
              Kein weiterer gespeicherter Kurs.
            </ThemedText>
          ) : (
            otherCourses.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setCourseSwitchOpen(false);
                  setSelectedCourse(c);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Wechsel zu ${c}`}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ThemedText style={{ fontWeight: '700' }}>
                  {c}
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={textColor}
                />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            onPress={() => {
              setCourseSwitchOpen(false);
              handleChangeCourse();
            }}
            accessibilityRole="button"
            accessibilityLabel="Anderen Kurs auswählen"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconSymbol
              name="rectangle.stack"
              size={16}
              color={textColor}
            />
            <ThemedText>Anderen Kurs auswählen …</ThemedText>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}

export default function TabLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CourseProvider>
        <TabsContent />
      </CourseProvider>
    </QueryClientProvider>
  );
}
