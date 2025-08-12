import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

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

// Course Context for sharing course state across the app
interface CourseContextType {
  selectedCourse: string | null;
  setSelectedCourse: (course: string | null) => void;
  isLoading: boolean;
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

interface CourseProviderProps {
  children: React.ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
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
    isLoading,
  };

  return (
    <CourseContext.Provider value={courseContextValue}>
      {children}
    </CourseContext.Provider>
  );
}
