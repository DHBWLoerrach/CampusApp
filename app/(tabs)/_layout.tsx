import { TouchableOpacity, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  CourseProvider,
  useCourseContext,
} from '@/context/CourseContext';
import { LAST_TAB_KEY } from '@/constants/StorageKeys';
import { navBarOptions } from '@/constants/Navigation';

const ICON_SIZE = 28;

function TabsContent() {
  const { selectedCourse, setSelectedCourse } = useCourseContext();

  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Vorlesungsplan';

  const handleChangeCourse = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  return (
    <Tabs screenOptions={navBarOptions}>
      <Tabs.Screen
        name="news"
        options={{
          title: 'DHBW Lörrach',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ICON_SIZE} name="house" color={color} />
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
            Storage.setItem(LAST_TAB_KEY, 'schedule').catch(() => {});
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
              onPress={() =>
                Alert.alert(
                  'Mensa Campus Hangstraße',
                  [
                    'Mo–Fr 9:30–13:45 Uhr',
                    'Mittagessen: 11:45–13:30 Uhr',
                    'Preise richten sich nach Personengruppen (kann unter Services > Einstellungen angepasst werden)',
                  ].join('\n'),
                )
              }
              hitSlop={8}
              style={{ marginRight: 16 }}
              accessibilityRole="button"
              accessibilityLabel="Öffnungszeiten der Mensa anzeigen"
              accessibilityHint="Zeigt die Öffnungszeiten für die Mensa Campus Hangstraße"
            >
              <IconSymbol size={20} name="clock" color="white" />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => {
            Storage.setItem(LAST_TAB_KEY, 'canteen').catch(() => {});
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
            Storage.setItem(LAST_TAB_KEY, 'services').catch(() => {});
          },
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <CourseProvider>
      <TabsContent />
    </CourseProvider>
  );
}
