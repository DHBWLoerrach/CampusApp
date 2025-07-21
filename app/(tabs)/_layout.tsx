import { Tabs } from 'expo-router';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { bottomTabBarOptions } from '@/constants/Navigation';

const ICON_SIZE = 28;

export default function TabLayout() {
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
        name="calendar"
        options={{
          title: 'Vorlesungen',
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
          title: 'Speiseplan',
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
