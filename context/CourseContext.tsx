import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';
import Storage from 'expo-sqlite/kv-store';

const STORAGE_KEY = 'scheduleCourse';

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
  children: ReactNode;
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
        const savedCourse = await Storage.getItem(STORAGE_KEY);
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
        await Storage.setItem(STORAGE_KEY, course);
      } else {
        await Storage.removeItem(STORAGE_KEY);
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
