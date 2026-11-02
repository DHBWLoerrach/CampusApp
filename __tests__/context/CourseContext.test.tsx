import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { CourseProvider, useCourseContext } from '@/context/CourseContext';

const COURSE_KEY = 'scheduleCourse';
const HISTORY_KEY = 'scheduleCourseHistory';

// In-memory storage that survives remounts, like the real KV store
const mockStore = new Map<string, string>();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CourseProvider>{children}</CourseProvider>
);

async function renderLoadedCourseContext() {
  const hook = await renderHook(() => useCourseContext(), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('CourseProvider', () => {
  beforeEach(() => {
    mockStore.clear();
    mockGetItem.mockImplementation(async (key: string) =>
      mockStore.has(key) ? mockStore.get(key) : null
    );
    mockSetItem.mockImplementation(async (key: string, value: string) => {
      mockStore.set(key, value);
    });
    mockRemoveItem.mockImplementation(async (key: string) => {
      mockStore.delete(key);
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts without course and history on first launch', async () => {
    const { result } = await renderLoadedCourseContext();

    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.previousCourses).toEqual([]);
  });

  it('stays loading until storage has answered', async () => {
    let resolveCourse: (value: string | null) => void = () => {};
    mockGetItem.mockImplementationOnce(
      () => new Promise((resolve) => (resolveCourse = resolve))
    );

    const { result } = await renderHook(() => useCourseContext(), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => resolveCourse('TIF25A'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedCourse).toBe('TIF25A');
  });

  it('normalizes a lowercase stored course and rewrites it', async () => {
    mockStore.set(COURSE_KEY, 'tif25a');

    const { result } = await renderLoadedCourseContext();

    expect(result.current.selectedCourse).toBe('TIF25A');
    expect(mockStore.get(COURSE_KEY)).toBe('TIF25A');
  });

  it('normalizes and de-duplicates the stored history', async () => {
    mockStore.set(COURSE_KEY, 'WDS25A');
    mockStore.set(
      HISTORY_KEY,
      JSON.stringify(['tif25a', 'TIF25A', 42, 'wwi24b'])
    );

    const { result } = await renderLoadedCourseContext();

    // The selected course is missing from the history and goes first
    expect(result.current.previousCourses).toEqual([
      'WDS25A',
      'TIF25A',
      'WWI24B',
    ]);
    expect(JSON.parse(mockStore.get(HISTORY_KEY) ?? '')).toEqual([
      'WDS25A',
      'TIF25A',
      'WWI24B',
    ]);
  });

  it('keeps the selected course when the stored history is invalid JSON', async () => {
    mockStore.set(COURSE_KEY, 'TIF25A');
    mockStore.set(HISTORY_KEY, '{not json');

    const { result } = await renderLoadedCourseContext();

    expect(result.current.selectedCourse).toBe('TIF25A');
    expect(result.current.previousCourses).toEqual([]);
  });

  it('persists course changes with the most recent course first', async () => {
    const { result, unmount } = await renderLoadedCourseContext();

    await act(() => result.current.setSelectedCourse('tif25a'));
    await act(() => result.current.setSelectedCourse('wwi24b'));
    await act(() => result.current.setSelectedCourse('TIF25A'));

    expect(result.current.selectedCourse).toBe('TIF25A');
    expect(result.current.previousCourses).toEqual(['TIF25A', 'WWI24B']);

    await unmount();
    const remounted = await renderLoadedCourseContext();

    expect(remounted.result.current.selectedCourse).toBe('TIF25A');
    expect(remounted.result.current.previousCourses).toEqual([
      'TIF25A',
      'WWI24B',
    ]);
  });

  it('clears the course but keeps the history', async () => {
    const { result, unmount } = await renderLoadedCourseContext();

    await act(() => result.current.setSelectedCourse('TIF25A'));
    await act(() => result.current.setSelectedCourse(null));

    expect(result.current.selectedCourse).toBeNull();
    expect(mockStore.has(COURSE_KEY)).toBe(false);

    await unmount();
    const remounted = await renderLoadedCourseContext();

    expect(remounted.result.current.selectedCourse).toBeNull();
    expect(remounted.result.current.previousCourses).toEqual(['TIF25A']);
  });

  it('removes a course from the history', async () => {
    mockStore.set(HISTORY_KEY, JSON.stringify(['TIF25A', 'WWI24B']));
    const { result, unmount } = await renderLoadedCourseContext();

    await act(() => result.current.removeCourseFromHistory('tif25a'));

    expect(result.current.previousCourses).toEqual(['WWI24B']);

    await unmount();
    const remounted = await renderLoadedCourseContext();

    expect(remounted.result.current.previousCourses).toEqual(['WWI24B']);
  });

  it('finishes loading without a course when storage fails', async () => {
    mockGetItem.mockRejectedValue(new Error('storage unavailable'));

    const { result } = await renderLoadedCourseContext();

    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.previousCourses).toEqual([]);
  });

  it('keeps the new course in memory when saving fails', async () => {
    const { result } = await renderLoadedCourseContext();
    mockSetItem.mockRejectedValue(new Error('disk full'));

    await act(() => result.current.setSelectedCourse('TIF25A'));

    expect(result.current.selectedCourse).toBe('TIF25A');
  });
});
