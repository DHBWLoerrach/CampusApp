import { fireEvent, render, within } from '@testing-library/react-native';
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
  it('expands online links from the chevron button without text measurement', async () => {
    const longUrl =
      'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abcdef1234567890%40thread.v2/0?context=%7B%22Tid%22%3A%22dhbw%22%7D';

    const { getByLabelText, getByText, queryByText } = await render(
      <LectureCard event={createEvent({ description: longUrl })} />
    );

    expect(getByLabelText('Mehr anzeigen')).toBeTruthy();
    expect(getByText('https://teams.microsoft.com/…')).toBeTruthy();
    expect(queryByText(longUrl)).toBeNull();

    await fireEvent.press(getByLabelText('Mehr anzeigen'));

    expect(getByLabelText('Weniger anzeigen')).toBeTruthy();
    expect(getByText(longUrl)).toBeTruthy();
  });

  it('shares one measuring slot between ghost and visible room text', async () => {
    // The invisible measuring text must wrap at exactly the width of the
    // visible text. If it instead spans the whole chip (icon included),
    // truncation goes undetected and the chip can never be expanded.
    const room = 'HS VI, Raum 023; K326';
    const { getAllByText } = await render(
      <LectureCard event={createEvent({ location: room })} />
    );

    const roomTexts = getAllByText(room);
    expect(roomTexts).toHaveLength(2); // ghost + visible

    // The two texts must have the same parent element (the shared slot), and
    // that parent must not also be the chip containing the door icon.
    const [ghost, visible] = roomTexts;
    expect(ghost.parent).not.toBeNull();
    expect(ghost.parent).toBe(visible.parent);
    expect(
      within(ghost.parent!).queryAllByText('door.left.hand.open')
    ).toHaveLength(0);
  });
});
