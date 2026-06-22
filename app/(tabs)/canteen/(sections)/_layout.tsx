import { useEffect, useMemo, useState } from 'react';
import { createMaterialTopTabNavigator } from 'expo-router/js-top-tabs';
import { withLayoutContext } from 'expo-router';
import {
  addDays,
  differenceInMilliseconds,
  format,
  startOfTomorrow,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { weekdayDates } from '@/lib/canteenService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';
import TopTabLabel from '@/components/ui/TopTabLabel';

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

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

function titleForIndex(index: number, currentTodayKey: string) {
  const dates = weekdayDates(5);
  const d = dates[index];
  if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
  const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const key = format(d, 'yyyy-MM-dd');
  if (key === currentTodayKey) return 'Heute';
  if (key === tomorrowKey) return 'Morgen';
  return format(d, 'EE', { locale: de }).replace('.', '');
}

function useCurrentDayKey() {
  const [currentDayKey, setCurrentDayKey] = useState(todayKey);

  useEffect(() => {
    const timeout = setTimeout(
      () => setCurrentDayKey(todayKey()),
      differenceInMilliseconds(startOfTomorrow(), new Date()) + 1000
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [currentDayKey]);

  return currentDayKey;
}

export default function CanteenLayout() {
  const currentDayKey = useCurrentDayKey();
  const titles = useMemo(
    () => ({
      index: titleForIndex(0, currentDayKey),
      day1: titleForIndex(1, currentDayKey),
      day2: titleForIndex(2, currentDayKey),
      day3: titleForIndex(3, currentDayKey),
      day4: titleForIndex(4, currentDayKey),
    }),
    [currentDayKey]
  );

  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    swipeEnabled: true,
    tabBarItemStyle: { flex: 1, paddingHorizontal: 0 },
    tabBarLabel: (props: {
      focused: boolean;
      children: string;
      color?: string;
    }) => <TopTabLabel {...props} />,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TopTabs screenOptions={enhancedTabBarOptions}>
        <TopTabs.Screen name="index" options={{ title: titles.index }} />
        <TopTabs.Screen name="day1" options={{ title: titles.day1 }} />
        <TopTabs.Screen name="day2" options={{ title: titles.day2 }} />
        <TopTabs.Screen name="day3" options={{ title: titles.day3 }} />
        <TopTabs.Screen name="day4" options={{ title: titles.day4 }} />
      </TopTabs>
    </QueryClientProvider>
  );
}
