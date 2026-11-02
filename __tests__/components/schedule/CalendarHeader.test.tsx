import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import CalendarHeader from '@/components/schedule/CalendarHeader';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('CalendarHeader', () => {
  it('exposes labelled buttons that trigger navigation', async () => {
    const onPressPrevious = jest.fn();
    const onPressNext = jest.fn();
    const onPressToday = jest.fn();

    await render(
      <CalendarHeader
        currentDate="2026-11-02"
        onPressPrevious={onPressPrevious}
        onPressNext={onPressNext}
        onPressToday={onPressToday}
      />
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Vorheriger Zeitraum' })
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Nächster Zeitraum' })
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Heute' }));

    expect(onPressPrevious).toHaveBeenCalledTimes(1);
    expect(onPressNext).toHaveBeenCalledTimes(1);
    expect(onPressToday).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('header', { name: 'November 2026' })).toBeTruthy();
  });

  it('gives the arrows touch targets of at least 44 points', async () => {
    await render(<CalendarHeader currentDate="2026-11-02" />);

    for (const name of ['Vorheriger Zeitraum', 'Nächster Zeitraum']) {
      const style = StyleSheet.flatten(
        screen.getByRole('button', { name }).props.style
      );
      expect(style.width).toBeGreaterThanOrEqual(44);
      expect(style.height).toBeGreaterThanOrEqual(44);
    }
  });
});
