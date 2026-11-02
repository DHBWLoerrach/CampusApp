import { toCalendarEvents } from '@/lib/calendarEvents';
import type { StructuredTimetable } from '@/lib/icalService';

describe('toCalendarEvents', () => {
  it('passes all-day events as Berlin calendar days, even on 23-hour days', () => {
    // Europe/Berlin switches to daylight saving time on 2027-03-28
    const data: StructuredTimetable = {
      '2027-03-28': [
        {
          uid: 'ostern-2',
          title: 'OSTERN',
          start: new Date('2027-03-27T23:00:00Z'),
          end: new Date('2027-03-28T22:00:00Z'),
          location: '',
          allDay: true,
        },
      ],
    };

    expect(toCalendarEvents(data, '#E2001A')).toEqual([
      expect.objectContaining({
        id: 'ostern-2',
        start: { date: '2027-03-28' },
        end: { date: '2027-03-28' },
        allDay: true,
        color: '#E2001A',
        titleColor: '#fff',
      }),
    ]);
  });

  it('passes timed events as date-times', () => {
    const data: StructuredTimetable = {
      '2026-11-02': [
        {
          uid: 'lecture',
          title: 'Geschäftsprozesse',
          start: new Date('2026-11-02T08:00:00Z'),
          end: new Date('2026-11-02T11:15:00Z'),
          location: 'S021',
          allDay: false,
        },
      ],
    };

    const [event] = toCalendarEvents(data, '#E2001A');

    expect(event.start).toEqual({ dateTime: expect.any(String) });
    expect(event.end).toEqual({ dateTime: expect.any(String) });
    expect(new Date((event.start as { dateTime: string }).dateTime)).toEqual(
      new Date('2026-11-02T08:00:00Z')
    );
    expect(event.titleColor).toBeUndefined();
  });
});
