import { Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60 * 6, // 6 hours
      retry: 1,
    },
  },
});

function titleForOffset(offset: number) {
  if (offset === 0) return 'Heute';
  if (offset === 1) return 'Morgen';
  const d = addDays(new Date(), offset);
  return format(d, 'EEE dd.MM', { locale: de });
}

export default function CanteenLayout() {
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarLabel: ({
      focused,
      children,
    }: {
      focused: boolean;
      children: string;
    }) => (
      <Text style={{ color: 'white', opacity: focused ? 1 : 0.7 }}>
        {children}
      </Text>
    ),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TopTabs screenOptions={enhancedTabBarOptions}>
        <TopTabs.Screen
          name="index"
          options={{ title: titleForOffset(0) }}
        />
        <TopTabs.Screen
          name="day1"
          options={{ title: titleForOffset(1) }}
        />
        <TopTabs.Screen
          name="day2"
          options={{ title: titleForOffset(2) }}
        />
        <TopTabs.Screen
          name="day3"
          options={{ title: titleForOffset(3) }}
        />
        <TopTabs.Screen
          name="day4"
          options={{ title: titleForOffset(4) }}
        />
      </TopTabs>
    </QueryClientProvider>
  );
}
