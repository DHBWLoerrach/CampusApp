import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ScheduleLayout from '@/app/(tabs)/schedule/_layout';

const mockStorageGetItem = jest.fn();
const mockUseCourseContext = jest.fn();
const mockGetDismissed = jest.fn();
const mockGetSeenCount = jest.fn();
const mockIncrementSeenCount = jest.fn();
const mockDismissPromo = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockStorageGetItem(...args),
  setItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  withLayoutContext: (Navigator: any) => Navigator,
}));

jest.mock('@react-navigation/material-top-tabs', () => {
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

  Navigator.Screen = ({ children }: any) => <View>{children}</View>;

  return {
    createMaterialTopTabNavigator: () => ({ Navigator }),
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
        text: '#11181c',
      }) as Record<string, string>
    )[colorName] ?? '#11181c',
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
    getCodeCompanionPromoSeenCount: (...args: unknown[]) =>
      mockGetSeenCount(...args),
    incrementCodeCompanionPromoSeenCount: (...args: unknown[]) =>
      mockIncrementSeenCount(...args),
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

jest.mock('@/components/schedule/CourseSetup', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/TopTabLabel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ScheduleLayout CodeCompanion promo', () => {
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorageGetItem.mockReset();
    mockUseCourseContext.mockReset();
    mockGetDismissed.mockReset();
    mockGetSeenCount.mockReset();
    mockIncrementSeenCount.mockReset();
    mockDismissPromo.mockReset();

    mockStorageGetItem.mockResolvedValue('index');
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'TIF24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });
    mockGetDismissed.mockResolvedValue(false);
    mockGetSeenCount.mockResolvedValue(0);
    mockIncrementSeenCount.mockResolvedValue(1);
    mockDismissPromo.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('shows the promo for an existing eligible course when promo keys are still missing', async () => {
    const { getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByText('DHBW CodeCompanion')).toBeTruthy();
    });

    expect(mockIncrementSeenCount).toHaveBeenCalledTimes(1);
  });

  it('does not show the promo for ineligible courses', async () => {
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'BWL24A',
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(
      queryByText('Kennst du schon die DHBW App CodeCompanion?')
    ).toBeNull();
    expect(queryByText('Nicht mehr automatisch anzeigen')).toBeNull();
    expect(mockIncrementSeenCount).not.toHaveBeenCalled();
  });

  it('does not show the promo when it was permanently dismissed', async () => {
    mockGetDismissed.mockResolvedValue(true);

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW CodeCompanion')).toBeNull();
    expect(
      queryByText('Kennst du schon die DHBW App CodeCompanion?')
    ).toBeNull();
    expect(mockIncrementSeenCount).not.toHaveBeenCalled();
  });

  it('shows a reopen banner after closing and enables permanent dismiss on the second open', async () => {
    const { getByText, queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByText('Schließen')).toBeTruthy();
    });

    fireEvent.press(getByText('Schließen'));

    await waitFor(() => {
      expect(
        getByText('Kennst du schon die DHBW App CodeCompanion?')
      ).toBeTruthy();
    });

    expect(queryByText('Nicht mehr automatisch anzeigen')).toBeNull();

    fireEvent.press(getByText('Kennst du schon die DHBW App CodeCompanion?'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });

    expect(mockIncrementSeenCount).toHaveBeenCalledTimes(2);
  });

  it('restores the reopen banner when permanent dismiss persistence fails', async () => {
    mockGetSeenCount.mockResolvedValue(1);
    mockIncrementSeenCount.mockResolvedValue(2);
    mockDismissPromo.mockRejectedValueOnce(new Error('storage failed'));

    const { getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(
        getByText('Kennst du schon die DHBW App CodeCompanion?')
      ).toBeTruthy();
    });

    fireEvent.press(getByText('Kennst du schon die DHBW App CodeCompanion?'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });

    fireEvent.press(getByText('Nicht mehr automatisch anzeigen'));

    await waitFor(() => {
      expect(mockDismissPromo).toHaveBeenCalledTimes(1);
      expect(
        getByText('Kennst du schon die DHBW App CodeCompanion?')
      ).toBeTruthy();
    });
  });
});
