import { render, within } from '@testing-library/react-native';
import { Platform } from 'react-native';
import CanteenStackLayout from '@/app/(tabs)/canteen/_layout';

// Renders the native toolbar items a Stack.Screen declares, grouped by
// placement, so they can be asserted on.
jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');

  const Stack = ({ children }: any) => <View>{children}</View>;
  Stack.Screen = ({ children }: any) => <View>{children}</View>;
  const Toolbar = ({ children, placement }: any) => (
    <View testID={`toolbar-${placement}`}>{children}</View>
  );
  Toolbar.Button = ({ accessibilityLabel, icon }: any) => (
    <Text accessibilityLabel={accessibilityLabel}>{icon}</Text>
  );
  Toolbar.View = ({ children }: any) => <View>{children}</View>;
  Stack.Toolbar = Toolbar;

  return { Stack };
});

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#11181c',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('@/components/ui/BottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));

describe('CanteenStackLayout header', () => {
  it('shows only the info button on iPhone', async () => {
    const { getByTestId, queryByTestId } = await render(<CanteenStackLayout />);

    expect(
      within(getByTestId('toolbar-right')).getByLabelText(
        'Mensa-Informationen anzeigen'
      )
    ).toBeTruthy();
    expect(queryByTestId('toolbar-left')).toBeNull();
  });

  it('fills the leading toolbar with the canteen name on iPad', async () => {
    // iPadOS hides the navigation title below the top tab bar, which would
    // leave the info button alone in its row.
    const isPad = jest
      .spyOn(Platform as unknown as { isPad: boolean }, 'isPad', 'get')
      .mockReturnValue(true);

    try {
      const { getByTestId } = await render(<CanteenStackLayout />);

      expect(
        within(getByTestId('toolbar-left')).getByText('Hangstraße')
      ).toBeTruthy();
    } finally {
      isPad.mockRestore();
    }
  });
});
