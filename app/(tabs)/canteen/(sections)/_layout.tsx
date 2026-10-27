import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import { getCanteenClosureForDates } from '@/lib/canteenClosures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';
import { MEDIUM_WINDOW_MIN_WIDTH } from '@/constants/Layout';
import CanteenClosedScreen from '@/components/canteen/CanteenClosedScreen';
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

function titleForIndex(
  index: number,
  currentTodayKey: string,
  longWeekday: boolean
) {
  const dates = weekdayDates(5);
  const d = dates[index];
  if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
  const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const key = format(d, 'yyyy-MM-dd');
  if (key === currentTodayKey) return 'Heute';
  if (key === tomorrowKey) return 'Morgen';
  if (longWeekday) return format(d, 'EEEE', { locale: de });
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
  // Reacts to fold/unfold, rotation, split-screen and system font size: wide
  // windows have room for full weekday names in the five equally sized tabs.
  // Labels grow with fontScale, so larger text needs a proportionally wider
  // window, otherwise "Donnerstag" would truncate to "Donner…". Side insets
  // are excluded because the tab bar is padded by them (see below).
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarWidth = width - insets.left - insets.right;
  const longWeekday = tabBarWidth / fontScale >= MEDIUM_WINDOW_MIN_WIDTH;
  const titles = useMemo(
    () => ({
      index: titleForIndex(0, currentDayKey, longWeekday),
      day1: titleForIndex(1, currentDayKey, longWeekday),
      day2: titleForIndex(2, currentDayKey, longWeekday),
      day3: titleForIndex(3, currentDayKey, longWeekday),
      day4: titleForIndex(4, currentDayKey, longWeekday),
    }),
    [currentDayKey, longWeekday]
  );

  // Recomputed on day change so the tabs come back by themselves as soon as the
  // first open weekday enters the rolling window.
  const closure = useMemo(
    () => getCanteenClosureForDates(weekdayDates(5)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDayKey]
  );

  if (closure) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
          <CanteenClosedScreen closure={closure} />
        </SafeAreaView>
      </QueryClientProvider>
    );
  }

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
      {/* The native stack header keeps clear of side insets (e.g. the status
          bar column on a folded cover display), the JS tab bar and the day
          views do not, so pad them horizontally here. */}
      <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
        <TopTabs screenOptions={enhancedTabBarOptions}>
          <TopTabs.Screen name="index" options={{ title: titles.index }} />
          <TopTabs.Screen name="day1" options={{ title: titles.day1 }} />
          <TopTabs.Screen name="day2" options={{ title: titles.day2 }} />
          <TopTabs.Screen name="day3" options={{ title: titles.day3 }} />
          <TopTabs.Screen name="day4" options={{ title: titles.day4 }} />
        </TopTabs>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
