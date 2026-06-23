import { fireEvent, render } from '@testing-library/react-native';
import LectureCard from '@/components/schedule/LectureCard';
import type { TimetableEvent } from '@/lib/icalService';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: (_props: unknown, colorName: string) =>
    (
      ({
        background: '#ffffff',
        border: '#d0d0d0',
        icon: '#687076',
        text: '#11181c',
      }) as Record<string, string>
    )[colorName] ?? '#11181c',
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');

  return {
    IconSymbol: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

const createEvent = (overrides?: Partial<TimetableEvent>): TimetableEvent => ({
  uid: 'event-1',
  title: 'Online-Vorlesung',
  start: new Date('2026-01-01T09:00:00+01:00'),
  end: new Date('2026-01-01T10:00:00+01:00'),
  location: 'online',
  ...overrides,
});

describe('LectureCard', () => {
  it('expands online links from the chevron button without text measurement', () => {
    const longUrl =
      'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abcdef1234567890%40thread.v2/0?context=%7B%22Tid%22%3A%22dhbw%22%7D';

    const { getByLabelText, getByText, queryByText } = render(
      <LectureCard event={createEvent({ description: longUrl })} />
    );

    expect(getByLabelText('Mehr anzeigen')).toBeTruthy();
    expect(getByText('https://teams.microsoft.com/…')).toBeTruthy();
    expect(queryByText(longUrl)).toBeNull();

    fireEvent.press(getByLabelText('Mehr anzeigen'));

    expect(getByLabelText('Weniger anzeigen')).toBeTruthy();
    expect(getByText(longUrl)).toBeTruthy();
  });
});
