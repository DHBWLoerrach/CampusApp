import CalendarView from '@/components/CalendarView';

const sampleEvents = [
  {
    id: '1',
    title: 'Mathematik Vorlesung',
    start: { dateTime: '2025-07-28T08:30:00+02:00' },
    end: { dateTime: '2025-07-28T10:00:00+02:00' },
    location: 'A123',
  },
  {
    id: '2',
    title: 'Informatik Praktikum',
    start: { dateTime: '2025-07-28T10:15:00+02:00' },
    end: { dateTime: '2025-07-28T11:45:00+02:00' },
    location: 'D161',
  },
  {
    id: '3',
    title: 'Betriebswirtschaftslehre',
    start: { dateTime: '2025-07-29T14:00:00+02:00' },
    end: { dateTime: '2025-07-29T15:30:00+02:00' },
    location: 'B203',
  },
];

export default function LecturesDays() {
  return <CalendarView numberOfDays={1} events={sampleEvents} />;
}
