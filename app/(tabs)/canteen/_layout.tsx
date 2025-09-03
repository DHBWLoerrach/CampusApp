import { Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { weekdayDates } from '@/lib/canteenService';
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

function titleForIndex(index: number) {
  const dates = weekdayDates(5);
  const d = dates[index];
  if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const key = format(d, 'yyyy-MM-dd');
  if (key === todayKey) return 'Heute';
  if (key === tomorrowKey) return 'Morgen';
  return format(d, 'EEE dd.MM', { locale: de });
}

export default function CanteenLayout() {
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarItemStyle: { paddingHorizontal: 0 },
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
          options={{ title: titleForIndex(0) }}
        />
        <TopTabs.Screen
          name="day1"
          options={{ title: titleForIndex(1) }}
        />
        <TopTabs.Screen
          name="day2"
          options={{ title: titleForIndex(2) }}
        />
        <TopTabs.Screen
          name="day3"
          options={{ title: titleForIndex(3) }}
        />
        <TopTabs.Screen
          name="day4"
          options={{ title: titleForIndex(4) }}
        />
      </TopTabs>
    </QueryClientProvider>
  );
}
