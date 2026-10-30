import { fireEvent, render } from '@testing-library/react-native';
import CodeCompanionPromoBanner from '@/components/schedule/CodeCompanionPromoBanner';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#ffffff',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('CodeCompanionPromoBanner', () => {
  it('renders the title and subtitle', async () => {
    const { getByText } = await render(
      <CodeCompanionPromoBanner onPress={() => {}} />
    );

    expect(getByText('DHBW Code Companion')).toBeTruthy();
    expect(getByText('Lern-App fürs Programmieren')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <CodeCompanionPromoBanner onPress={onPress} />
    );

    await fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
