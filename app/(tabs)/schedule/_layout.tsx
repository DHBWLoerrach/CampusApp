import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';

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

export default function ScheduleLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TopTabs screenOptions={topTabBarOptions}>
        <TopTabs.Screen name="index" options={{ title: 'Liste' }} />
        <TopTabs.Screen name="week" options={{ title: 'Woche' }} />
        <TopTabs.Screen name="day" options={{ title: 'Tag' }} />
      </TopTabs>
    </QueryClientProvider>
  );
}
