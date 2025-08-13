import { Tabs } from 'expo-router';
import { TouchableOpacity, Alert } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { bottomTabBarOptions } from '@/constants/Navigation';
import {
  CourseProvider,
  useCourseContext,
} from '@/context/CourseContext';

const ICON_SIZE = 28;

function TabsContent() {
  const { selectedCourse, setSelectedCourse } = useCourseContext();

  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Vorlesungsplan';

  const handleChangeCourse = () => {
    if (selectedCourse) {
      Alert.alert(
        'Kurs ändern',
        `Möchten Sie den aktuellen Kurs "${selectedCourse}" verlassen und einen neuen Kurs auswählen?`,
        [
          {
            text: 'Abbrechen',
            style: 'cancel',
          },
          {
            text: 'Kurs ändern',
            style: 'destructive',
            onPress: () => setSelectedCourse(null),
          },
        ]
      );
    }
  };

  return (
    <Tabs screenOptions={bottomTabBarOptions}>
      <Tabs.Screen
        name="news"
        options={{
          title: 'DHBW Lörrach',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ICON_SIZE} name="house" color={color} />
          ),
          tabBarLabel: 'DHBW',
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
                  <IconSymbol size={20} name="pencil" color="white" />
                </TouchableOpacity>
              )
            : undefined,
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
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={ICON_SIZE}
              name="info.circle"
              color={color}
            />
          ),
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
