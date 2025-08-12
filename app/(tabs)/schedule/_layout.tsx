import { Text } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { topTabBarOptions } from '@/constants/Navigation';
import CourseSetup from '@/components/CourseSetup';
import { useCourseContext } from '@/context/CourseContext';

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
  const { selectedCourse, setSelectedCourse, isLoading } =
    useCourseContext();

  // Enhanced tab options with course display
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarLabel: ({
      focused,
      children,
    }: {
      focused: boolean;
      children: string;
    }) => (
      <Text
        style={{
          color: 'white',
          opacity: focused ? 1 : 0.7,
        }}
      >
        {children}
      </Text>
    ),
  };

  // Show loading while reading from storage
  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <QueryClientProvider client={queryClient}>
      {selectedCourse ? (
        // Show tabs when course is selected
        <TopTabs screenOptions={enhancedTabBarOptions}>
          <TopTabs.Screen name="index" options={{ title: 'Liste' }} />
          <TopTabs.Screen name="week" options={{ title: 'Woche' }} />
          <TopTabs.Screen name="day" options={{ title: 'Tag' }} />
        </TopTabs>
      ) : (
        // Show course setup when no course is selected
        <CourseSetup onCourseSelected={setSelectedCourse} />
      )}
    </QueryClientProvider>
  );
}
