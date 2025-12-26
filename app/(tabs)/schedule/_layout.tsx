import Storage from 'expo-sqlite/kv-store';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';
import CourseSetup from '@/components/schedule/CourseSetup';
import { useCourseContext } from '@/context/CourseContext';
import { LAST_SCHEDULE_SUBTAB_KEY } from '@/constants/StorageKeys';
import { useEffect, useState } from 'react';
import TopTabLabel from '@/components/ui/TopTabLabel';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

// Create a shared query client instance for all schedule views
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered "fresh" for 4 hours. No refetch on mount.
      staleTime: 1000 * 60 * 60 * 4,
      // Data stays in cache for 24 hours after being unused.
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

type SubTabName = 'index' | 'week' | 'day';

export default function ScheduleLayout() {
  const { selectedCourse, setSelectedCourse, isLoading } = useCourseContext();
  const [initialSubTab, setInitialSubTab] = useState<SubTabName | null>(null);

  // Read last opened schedule sub-tab so we can set it as initial route
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await Storage.getItem(LAST_SCHEDULE_SUBTAB_KEY)) as
          | string
          | null;
        if (!mounted) return;
        const allowed: readonly SubTabName[] = ['index', 'week', 'day'];
        setInitialSubTab(
          saved && (allowed as readonly string[]).includes(saved)
            ? (saved as SubTabName)
            : 'index',
        );
      } catch {
        if (mounted) setInitialSubTab('index');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Enhanced tab options with course display
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarLabel: (props: {
      focused: boolean;
      children: string;
      color?: string;
    }) => <TopTabLabel {...props} />,
  };

  // Show loading while reading from storage
  if (isLoading || initialSubTab === null) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <QueryClientProvider client={queryClient}>
      {selectedCourse ? (
        // Show tabs when course is selected
        <TopTabs
          screenOptions={enhancedTabBarOptions}
          initialRouteName={initialSubTab}
        >
          <TopTabs.Screen
            name="index"
            options={{ title: 'Liste' }}
            listeners={{
              focus: () => {
                Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'index').catch(
                  () => {},
                );
                // Keep local state in sync so remounts (e.g., after course change)
                // restore the last viewed sub-tab instead of defaulting unexpectedly.
                setInitialSubTab('index');
              },
            }}
          />
          <TopTabs.Screen
            name="week"
            options={{ title: 'Woche' }}
            listeners={{
              focus: () => {
                Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'week').catch(
                  () => {},
                );
                setInitialSubTab('week');
              },
            }}
          />
          <TopTabs.Screen
            name="day"
            options={{ title: 'Tag' }}
            listeners={{
              focus: () => {
                Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'day').catch(
                  () => {},
                );
                setInitialSubTab('day');
              },
            }}
          />
        </TopTabs>
      ) : (
        // Show course setup when no course is selected
        <CourseSetup onCourseSelected={setSelectedCourse} />
      )}
    </QueryClientProvider>
  );
}
