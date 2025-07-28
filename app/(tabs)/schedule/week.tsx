import CalendarView from '@/components/CalendarView';

const sampleEvents = [
  {
    id: '1',
    title: 'Ausschusssitzung',
    start: { dateTime: '2025-07-28T10:00:00+02:00' },
    end: { dateTime: '2025-07-28T11:00:00+02:00' },
    location: 'A101',
  },
  {
    id: '2',
    title: 'Coffee break',
    start: { dateTime: '2025-07-28T15:00:00+02:00' },
    end: { dateTime: '2025-07-28T16:00:00+02:00' },
    location: 'Mensa',
  },
];

export default function LecturesWeek() {
  return <CalendarView numberOfDays={7} events={sampleEvents} />;
}
