import { Tabs } from 'expo-router';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { bottomTabBarOptions } from '@/constants/Navigation';
import {
  CourseProvider,
  useCourseContext,
} from '@/app/context/CourseContext';

const ICON_SIZE = 28;

function TabsContent() {
  const { selectedCourse } = useCourseContext();

  // Generate dynamic title: Course name in uppercase or fallback to "Stundenplan"
  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Stundenplan';

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
