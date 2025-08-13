import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';
import Storage from 'expo-sqlite/kv-store';

const COURSE_KEY = 'scheduleCourse';
const HISTORY_KEY = 'scheduleCourseHistory';

// Course Context for sharing course state across the app
interface CourseContextType {
  selectedCourse: string | null;
  setSelectedCourse: (course: string | null) => void;
  isLoading: boolean;
  previousCourses: string[];
  removeCourseFromHistory: (course: string) => Promise<void>;
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
  const [previousCourses, setPreviousCourses] = useState<string[]>(
    []
  );

  // Load course from storage on mount
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const savedCourse = await Storage.getItem(COURSE_KEY);
        if (savedCourse) {
          setSelectedCourseInternal(savedCourse);
        }
        const historyRaw = await Storage.getItem(HISTORY_KEY);
        if (historyRaw) {
          try {
            const parsed: unknown = JSON.parse(historyRaw);
            if (Array.isArray(parsed)) {
              // ensure string[]
              const list = parsed.filter(
                (x) => typeof x === 'string'
              ) as string[];
              setPreviousCourses(list);
              // if there is a saved course but it's not in history yet (from older app version), add it to front
              if (savedCourse && !list.includes(savedCourse)) {
                const next = [savedCourse, ...list];
                await Storage.setItem(
                  HISTORY_KEY,
                  JSON.stringify(next)
                );
                setPreviousCourses(next);
              }
            }
          } catch (err) {
            console.warn(
              'Failed to parse course history from storage:',
              err
            );
          }
        }
      } catch (error) {
        console.warn('Failed to load course from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, []);

  // Helper to persist history list
  const persistHistory = async (list: string[]) => {
    try {
      setPreviousCourses(list);
      await Storage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (error) {
      console.warn(
        'Failed to save course history to storage:',
        error
      );
    }
  };

  // Add a course to history (most recent first, unique)
  const addCourseToHistory = async (course: string) => {
    const trimmed = course.trim();
    if (!trimmed) return;
    const next = [
      trimmed,
      ...previousCourses.filter((c) => c !== trimmed),
    ];
    await persistHistory(next);
  };

  // Save course to storage whenever it changes
  const setSelectedCourse = async (course: string | null) => {
    setSelectedCourseInternal(course);
    try {
      if (course) {
        await Storage.setItem(COURSE_KEY, course);
        // maintain history list
        await addCourseToHistory(course);
      } else {
        await Storage.removeItem(COURSE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save course to storage:', error);
    }
  };

  const removeCourseFromHistory = async (course: string) => {
    const next = previousCourses.filter((c) => c !== course);
    await persistHistory(next);
  };

  const courseContextValue: CourseContextType = {
    selectedCourse,
    setSelectedCourse,
    isLoading,
    previousCourses,
    removeCourseFromHistory,
  };

  return (
    <CourseContext.Provider value={courseContextValue}>
      {children}
    </CourseContext.Provider>
  );
}
