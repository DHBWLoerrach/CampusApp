import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ScheduleLayout from '@/app/(tabs)/schedule/(sections)/_layout';

const mockStorageGetItem = jest.fn();
const mockStorageSetItem = jest.fn();
const mockUseCourseContext = jest.fn();
const mockGetDismissed = jest.fn();
const mockDismissPromo = jest.fn();
const mockRouterNavigate = jest.fn();
// The sub-tab the tabs focus first: the list when the tab bar opens plain
// /schedule, or the sub-tab a cold start redirected to.
let mockFirstFocusedSubTab = 'index';

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockStorageGetItem(...args),
  setItem: (...args: unknown[]) => mockStorageSetItem(...args),
}));

jest.mock('expo-router', () => ({
  useIsFocused: () => true,
  router: {
    navigate: (...args: unknown[]) => mockRouterNavigate(...args),
  },
}));

jest.mock('expo-router/js-top-tabs', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MaterialTopTabBar = () => <Text>TopTabBar</Text>;
  const Navigator = ({ children, tabBar }: any) => (
    <View>
      {tabBar
        ? tabBar({
            state: {} as any,
            descriptors: {} as any,
            navigation: {} as any,
            position: {} as any,
          })
        : null}
      {children}
    </View>
  );

  Navigator.Screen = ({ name, listeners }: any) => {
    React.useEffect(() => {
      if (name === mockFirstFocusedSubTab) listeners?.focus?.();
      // Only the first focus matters here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };

  return {
    TopTabs: Navigator,
    MaterialTopTabBar,
  };
});

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: (_props: unknown, colorName: string) =>
    (
      ({
        background: '#ffffff',
        border: '#d0d0d0',
        dayNumberContainer: '#eef5ff',
        icon: '#687076',
        text: '#11181c',
      }) as Record<string, string>
    )[colorName] ?? '#11181c',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('@/context/CourseContext', () => ({
  useCourseContext: () => mockUseCourseContext(),
}));

jest.mock('@/lib/codeCompanionPromo', () => {
  const actual = jest.requireActual('@/lib/codeCompanionPromo');
  return {
    ...actual,
    getCodeCompanionPromoDismissed: (...args: unknown[]) =>
      mockGetDismissed(...args),
    dismissCodeCompanionPromo: (...args: unknown[]) =>
      mockDismissPromo(...args),
  };
});

jest.mock('@/components/ui/BottomSheet', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    __esModule: true,
    default: ({ visible, title, titleContent, children }: any) =>
      visible ? (
        <View>
          {titleContent ?? <Text>{title}</Text>}
          {children}
        </View>
      ) : null,
  };
});

jest.mock('@/components/schedule/CourseSetup', () => {
  const { Text } = require('react-native');

  return {
    __esModule: true,
    default: ({
      onCourseSelected,
    }: {
      onCourseSelected: (course: string) => void;
    }) => <Text onPress={() => onCourseSelected('TIF24A')}>Kurs wählen</Text>,
  };
});

jest.mock('@/components/ui/TopTabLabel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ScheduleLayout Code Companion promo', () => {
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorageGetItem.mockReset();
    mockStorageSetItem.mockReset();
    mockStorageSetItem.mockResolvedValue(undefined);
    mockUseCourseContext.mockReset();
    mockGetDismissed.mockReset();
    mockDismissPromo.mockReset();
    mockRouterNavigate.mockReset();
    mockFirstFocusedSubTab = 'index';

    mockStorageGetItem.mockResolvedValue('index');
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'TIF24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });
    mockGetDismissed.mockResolvedValue(false);
    mockDismissPromo.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('shows the banner for an eligible course without auto-opening the sheet', async () => {
    const { getByText, queryByText } = await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByText('DHBW Code Companion')).toBeTruthy();
    });

    // Sheet content is not rendered until the banner is tapped.
    expect(queryByText('Nicht mehr automatisch anzeigen')).toBeNull();
  });

  it('does not show the banner for ineligible courses', async () => {
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'BWL24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });

    const { queryByText } = await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('does not show the banner when permanently dismissed', async () => {
    mockGetDismissed.mockResolvedValue(true);

    const { queryByText } = await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('opens the sheet with both actions when the banner is tapped', async () => {
    const { getByLabelText, getByText } = await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    await fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });
    expect(getByText('Schließen')).toBeTruthy();
  });

  it('restores the banner when permanent dismiss persistence fails', async () => {
    mockDismissPromo.mockRejectedValueOnce(new Error('storage failed'));

    const { getByLabelText, getByText } = await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    await fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });

    await fireEvent.press(getByText('Nicht mehr automatisch anzeigen'));

    await waitFor(() => {
      expect(mockDismissPromo).toHaveBeenCalledTimes(1);
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });
  });

  it('restores the last sub-tab after a course is selected', async () => {
    const setSelectedCourse = jest.fn();
    mockStorageGetItem.mockResolvedValue('week');
    mockUseCourseContext.mockReturnValue({
      selectedCourse: null,
      setSelectedCourse,
      isLoading: false,
    });

    const { findByText } = await render(<ScheduleLayout />);
    await fireEvent.press(await findByText('Kurs wählen'));

    expect(setSelectedCourse).toHaveBeenCalledWith('TIF24A');
    expect(mockRouterNavigate).toHaveBeenCalledWith('/schedule/week');
  });

  it('restores the last sub-tab when the tab bar opens the schedule', async () => {
    mockStorageGetItem.mockResolvedValue('week');

    await render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockRouterNavigate).toHaveBeenCalledWith('/schedule/week');
    });
    expect(mockRouterNavigate).toHaveBeenCalledTimes(1);
    // The list only shows until the navigation lands, so it is not persisted.
    expect(mockStorageSetItem).not.toHaveBeenCalledWith(
      'lastScheduleSubtab',
      'index'
    );
  });

  it('keeps the sub-tab a cold start already redirected to', async () => {
    mockStorageGetItem.mockResolvedValue('week');
    mockFirstFocusedSubTab = 'week';

    const { findByText } = await render(<ScheduleLayout />);

    // The tabs only render once the stored sub-tab has been read.
    await findByText('TopTabBar');
    expect(mockRouterNavigate).not.toHaveBeenCalled();
  });

  it('stays on the list when it was the last sub-tab', async () => {
    const { findByText } = await render(<ScheduleLayout />);

    await findByText('TopTabBar');
    expect(mockRouterNavigate).not.toHaveBeenCalled();
  });
});
