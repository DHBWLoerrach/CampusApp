import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ScheduleLayout from '@/app/(tabs)/schedule/(sections)/_layout';

const mockStorageGetItem = jest.fn();
const mockUseCourseContext = jest.fn();
const mockGetDismissed = jest.fn();
const mockDismissPromo = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockStorageGetItem(...args),
  setItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useIsFocused: () => true,
  withLayoutContext: (Navigator: any) => Navigator,
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

jest.mock('@/components/schedule/CourseSetup', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/ui/TopTabLabel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ScheduleLayout Code Companion promo', () => {
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorageGetItem.mockReset();
    mockUseCourseContext.mockReset();
    mockGetDismissed.mockReset();
    mockDismissPromo.mockReset();

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
    const { getByText, queryByText } = render(<ScheduleLayout />);

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

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('does not show the banner when permanently dismissed', async () => {
    mockGetDismissed.mockResolvedValue(true);

    const { queryByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(mockGetDismissed).toHaveBeenCalledTimes(1);
    });

    expect(queryByText('DHBW Code Companion')).toBeNull();
  });

  it('opens the sheet with both actions when the banner is tapped', async () => {
    const { getByLabelText, getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });
    expect(getByText('Schließen')).toBeTruthy();
  });

  it('restores the banner when permanent dismiss persistence fails', async () => {
    mockDismissPromo.mockRejectedValueOnce(new Error('storage failed'));

    const { getByLabelText, getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    await waitFor(() => {
      expect(getByText('Nicht mehr automatisch anzeigen')).toBeTruthy();
    });

    fireEvent.press(getByText('Nicht mehr automatisch anzeigen'));

    await waitFor(() => {
      expect(mockDismissPromo).toHaveBeenCalledTimes(1);
      expect(getByLabelText('DHBW Code Companion öffnen')).toBeTruthy();
    });
  });
});
