import { fireEvent, render } from '@testing-library/react-native';
import CodeCompanionPromoBanner from '@/components/schedule/CodeCompanionPromoBanner';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#ffffff',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('CodeCompanionPromoBanner', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = render(<CodeCompanionPromoBanner onPress={() => {}} />);

    expect(getByText('DHBW Code Companion')).toBeTruthy();
    expect(getByText('Quizfragen · Lernpfade · Lernfortschritt')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <CodeCompanionPromoBanner onPress={onPress} />
    );

    fireEvent.press(getByLabelText('DHBW Code Companion öffnen'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
