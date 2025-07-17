import { Tabs } from 'expo-router';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { bottomTabBarOptions } from '@/constants/Navigation';

export default function TabLayout() {
  return (
    <Tabs screenOptions={bottomTabBarOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Neuigkeiten und Termine',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house" color={color} />
          ),
          tabBarLabel: 'DHBW',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Vorlesungen',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="canteen"
        options={{
          title: 'Speiseplan',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="fork.knife" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="info.circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
