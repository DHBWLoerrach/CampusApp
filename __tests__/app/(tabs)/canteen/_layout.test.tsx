import { render, screen } from '@testing-library/react-native';
import CanteenLayout from '@/app/(tabs)/canteen/(sections)/_layout';

let mockWindowWidth = 390;
let mockFontScale = 1;
let mockRightInset = 0;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({
    width: mockWindowWidth,
    height: 800,
    scale: 3,
    fontScale: mockFontScale,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({
      top: 0,
      right: mockRightInset,
      bottom: 0,
      left: 0,
    }),
  };
});

// Renders each screen's title so the tab labels can be asserted on.
jest.mock('expo-router', () => {
  const { View, Text } = require('react-native');

  return {
    withLayoutContext: () => {
      const Navigator = ({ children }: any) => <View>{children}</View>;
      Navigator.Screen = ({ options }: any) => <Text>{options?.title}</Text>;
      return Navigator;
    },
  };
});

jest.mock('expo-router/js-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({ Navigator: () => null }),
}));

jest.mock('@/lib/canteenClosures', () => ({
  getCanteenClosureForDates: () => null,
}));

jest.mock('@/components/canteen/CanteenClosedScreen', () => ({
  __esModule: true,
  default: () => null,
}));

describe('CanteenLayout weekday tab titles', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Monday, so the window is Mon–Fri of the same week.
    jest.setSystemTime(new Date(2026, 9, 26, 10, 0));
    mockFontScale = 1;
    mockRightInset = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('abbreviates weekdays on narrow windows', () => {
    mockWindowWidth = 390;
    render(<CanteenLayout />);

    for (const title of ['Heute', 'Morgen', 'Mi', 'Do', 'Fr']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.queryByText('Mittwoch')).toBeNull();
  });

  it('spells out weekdays on medium-width windows', () => {
    mockWindowWidth = 600;
    render(<CanteenLayout />);

    for (const title of [
      'Heute',
      'Morgen',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
    ]) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.queryByText('Mi')).toBeNull();
  });

  it('keeps abbreviations on medium-width windows with large system text', () => {
    mockWindowWidth = 600;
    mockFontScale = 1.5;
    render(<CanteenLayout />);

    for (const title of ['Heute', 'Morgen', 'Mi', 'Do', 'Fr']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.queryByText('Donnerstag')).toBeNull();
  });

  it('spells out weekdays with large system text when the window is wide enough', () => {
    mockWindowWidth = 900;
    mockFontScale = 1.5;
    render(<CanteenLayout />);

    for (const title of ['Mittwoch', 'Donnerstag', 'Freitag']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it('excludes side insets from the width available to the tabs', () => {
    // Wide enough on its own, but the status bar column takes 84 dp.
    mockWindowWidth = 650;
    mockRightInset = 84;
    render(<CanteenLayout />);

    for (const title of ['Mi', 'Do', 'Fr']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.queryByText('Donnerstag')).toBeNull();
  });
});
