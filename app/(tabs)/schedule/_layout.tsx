import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { Text } from 'react-native';
import { topTabBarOptions } from '@/constants/Navigation';
import CourseSetup from '@/components/CourseSetup';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

// Storage key for persisting the course
const COURSE_STORAGE_KEY = '@schedule_course';

// Simple storage fallback if AsyncStorage fails
let memoryStorage: { [key: string]: string } = {};

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try AsyncStorage first
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // Fallback to memory storage
      console.warn(
        'AsyncStorage failed, using memory storage:',
        error
      );
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try AsyncStorage first
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Fallback to memory storage
      console.warn(
        'AsyncStorage failed, using memory storage:',
        error
      );
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // Try AsyncStorage first
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Fallback to memory storage
      console.warn(
        'AsyncStorage failed, using memory storage:',
        error
      );
      delete memoryStorage[key];
    }
  },
};

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

// Course Context for sharing course state across schedule tabs
interface CourseContextType {
  selectedCourse: string | null;
  setSelectedCourse: (course: string | null) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(
  undefined
);

export function useCourseContext() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error(
      'useCourseContext must be used within a CourseProvider'
    );
  }
  return context;
}

export default function ScheduleLayout() {
  const [selectedCourse, setSelectedCourseInternal] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load course from storage on mount
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const savedCourse = await safeStorage.getItem(
          COURSE_STORAGE_KEY
        );
        if (savedCourse) {
          setSelectedCourseInternal(savedCourse);
        }
      } catch (error) {
        console.warn('Failed to load course from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, []);

  // Save course to storage whenever it changes
  const setSelectedCourse = async (course: string | null) => {
    setSelectedCourseInternal(course);
    try {
      if (course) {
        await safeStorage.setItem(COURSE_STORAGE_KEY, course);
      } else {
        await safeStorage.removeItem(COURSE_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save course to storage:', error);
    }
  };

  const courseContextValue: CourseContextType = {
    selectedCourse,
    setSelectedCourse,
  };

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
          color: focused ? 'white' : 'white',
          fontSize: 14,
          opacity: focused ? 1 : 0.7,
        }}
      >
        {children}
        {selectedCourse ? ` (${selectedCourse.toUpperCase()})` : ''}
      </Text>
    ),
  };

  // Show loading while reading from storage
  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CourseContext.Provider value={courseContextValue}>
        {selectedCourse ? (
          // Show tabs when course is selected
          <TopTabs screenOptions={enhancedTabBarOptions}>
            <TopTabs.Screen
              name="index"
              options={{ title: 'Liste' }}
            />
            <TopTabs.Screen
              name="week"
              options={{ title: 'Woche' }}
            />
            <TopTabs.Screen name="day" options={{ title: 'Tag' }} />
          </TopTabs>
        ) : (
          // Show course setup when no course is selected
          <CourseSetup onCourseSelected={setSelectedCourse} />
        )}
      </CourseContext.Provider>
    </QueryClientProvider>
  );
}
