import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  LocaleConfigsProps,
  OnEventResponse,
  PackedEvent,
} from '@howljs/calendar-kit';
import { useTimetable } from '@/hooks/useTimetable';
import { useCourseContext } from '@/context/CourseContext';
import Header from '@/components/schedule/CalendarHeader';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import LinkifiedText from '@/components/ui/LinkifiedText';
import { toLocalISOString } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
}

interface ScheduleCalendarViewProps {
  numberOfDays: number;
  hideWeekDays?: number[];
}

const now = new Date();
// Build initial date at local midnight; if today is Sunday (0), advance to Monday
const _initialAtMidnight = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  0,
  0,
  0,
  0
);
if (_initialAtMidnight.getDay() === 0) {
  _initialAtMidnight.setDate(_initialAtMidnight.getDate() + 1);
}
const INITIAL_DATE = toLocalISOString(_initialAtMidnight);

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  de: {
    weekDayShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
    meridiem: { ante: 'vorm.', post: 'nachm.' },
    more: 'mehr',
  },
};

export default function ScheduleCalendarView({
  numberOfDays,
  hideWeekDays = [],
}: ScheduleCalendarViewProps) {
  const { selectedCourse } = useCourseContext();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useTimetable(selectedCourse || undefined);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);

  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const dayNumberContainer = useThemeColor({}, 'dayNumberContainer');
  const dayTextColor = useThemeColor({}, 'dayTextColor');
  const textColor = useThemeColor({}, 'text');

  // Transform timetable data to CalendarView format
  const events = useMemo((): CalendarEvent[] => {
    if (!data) return [];

    // Get all events (past and future) for full navigation
    const allEvents: CalendarEvent[] = [];

    Object.keys(data).forEach((dateKey) => {
      data[dateKey].forEach((event) => {
        allEvents.push({
          id: event.uid,
          title: event.title,
          start: { dateTime: toLocalISOString(event.start) },
          end: { dateTime: toLocalISOString(event.end) },
          location: event.location,
        });
      });
    });

    return allEvents;
  }, [data]);

  const _onChange = useCallback((date: string) => {
    currentDate.value = date;
  }, []);

  const _onPressToday = useCallback(() => {
    calendarRef.current?.goToDate({
      date: toLocalISOString(new Date()),
      animatedDate: true,
      hourScroll: true,
    });
  }, []);

  const onPressPrevious = () => {
    calendarRef.current?.goToPrevPage();
  };

  const onPressNext = () => {
    calendarRef.current?.goToNextPage();
  };

  const onPressEvent = (event: OnEventResponse) => {
    if (!event.start?.dateTime || !event.end?.dateTime) return;

    const { dateTime: startTime } = event.start;
    const { dateTime: endTime } = event.end;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const d = startDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const msInDay = 24 * 60 * 60 * 1000;
    const isAllDay =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      (endDate.getTime() - startDate.getTime()) % msInDay === 0;

    const body = isAllDay
      ? `${d}\nGanzer Tag\n${event.location || ''}`
      : (() => {
          const t = startDate.toLocaleTimeString('de-DE', {
            hour: 'numeric',
            minute: 'numeric',
          });
          const t2 = endDate.toLocaleTimeString('de-DE', {
            hour: 'numeric',
            minute: 'numeric',
          });
          return `${d}\n${t} - ${t2} Uhr\n${event.location || ''}`;
        })();
    Alert.alert(event.title || '', body);
  };

  const renderEvent = useCallback(
    (event: PackedEvent) => (
      <View style={{ height: '100%', padding: 4 }}>
        <Text
          style={{ fontWeight: 'bold', color: '#fff', fontSize: 12 }}
        >
          {event.title || ''}
        </Text>
        {event.location && (
          <LinkifiedText
            value={event.location as string}
            style={{ color: '#fff', fontSize: 12 }}
          />
        )}
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Vorlesungsplan wird geladen...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorWithReloadButton
        error={error as Error}
        isFetching={isFetching}
        refetch={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        currentDate={currentDate}
        onPressToday={_onPressToday}
        onPressPrevious={onPressPrevious}
        onPressNext={onPressNext}
      />
      <CalendarContainer
        ref={calendarRef}
        numberOfDays={numberOfDays}
        hideWeekDays={hideWeekDays} // we hide Sundays in week view
        initialDate={INITIAL_DATE}
        onChange={_onChange}
        onRefresh={() => {
          void refetch();
        }}
        isLoading={isFetching}
        allowPinchToZoom={true}
        hourWidth={50}
        initialLocales={initialLocales}
        locale="de"
        events={events}
        onPressEvent={onPressEvent}
        scrollToNow={false}
        start={420}
        end={1200}
        timeZone="Europe/Berlin"
        theme={{
          colors: {
            background: backgroundColor,
            border: borderColor,
          },
          eventContainerStyle: {
            backgroundColor: tintColor,
          },
          nowIndicatorColor: 'magenta',
          headerBackgroundColor: backgroundColor,
          hourTextStyle: { color: tintColor, fontWeight: '600' },
          todayName: { color: tintColor, fontWeight: '600' },
          todayNumberContainer: {
            backgroundColor: tintColor,
          },
          dayName: { color: textColor },
          dayNumber: { color: dayTextColor },
          dayNumberContainer: {
            backgroundColor: dayNumberContainer,
          },
        }}
      >
        <CalendarHeader />
        <CalendarBody renderEvent={renderEvent} />
      </CalendarContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
