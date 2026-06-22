import ScheduleCalendarView from '@/components/schedule/ScheduleCalendarView';

export default function LecturesWeek() {
  // we hide Sundays in week view
  return <ScheduleCalendarView numberOfDays={7} hideWeekDays={[7]} />;
}
