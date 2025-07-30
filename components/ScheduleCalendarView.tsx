import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
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
import { useCourseContext } from '@/app/context/CourseContext';
import Header from '@/components/CalendarHeader';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CalendarEvent {
  id: string;
  title: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
}

interface ScheduleCalendarViewProps {
  numberOfDays: number;
}

const now = new Date();
const INITIAL_DATE = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
).toISOString();

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  de: {
    weekDayShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
    meridiem: { ante: 'vorm.', post: 'nachm.' },
    more: 'mehr',
  },
};

export default function ScheduleCalendarView({
  numberOfDays,
}: ScheduleCalendarViewProps) {
  const { selectedCourse, setSelectedCourse } = useCourseContext();
  const { data, isLoading, isError, error } = useTimetable(
    selectedCourse || undefined
  );
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
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
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
      date: new Date().toISOString(),
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
    const t = startDate.toLocaleTimeString('de-DE', {
      hour: 'numeric',
      minute: 'numeric',
    });
    const t2 = endDate.toLocaleTimeString('de-DE', {
      hour: 'numeric',
      minute: 'numeric',
    });

    const body = `${d}\n${t} - ${t2} Uhr\n${event.location || ''}`;
    Alert.alert(event.title || '', body);
  };

  const renderEvent = useCallback(
    (event: PackedEvent) => (
      <View style={{ height: '100%', padding: 4 }}>
        <Text
          style={{ fontWeight: 'bold', color: 'white', fontSize: 12 }}
        >
          {event.title || ''}
        </Text>
        {event.location && (
          <Text style={{ color: 'white', fontSize: 12 }}>
            {event.location}
          </Text>
        )}
      </View>
    ),
    []
  );

  const handleChangeCourse = () => {
    Alert.alert(
      'Kurs ändern',
      `Möchten Sie den aktuellen Kurs "${selectedCourse}" verlassen und einen neuen Kurs auswählen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Kurs ändern',
          style: 'destructive',
          onPress: () => setSelectedCourse(null),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Stundenplan wird geladen...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Ein Fehler ist aufgetreten:
        </Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
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
        onChange={_onChange}
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

      {/* Floating Action Button for changing course */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleChangeCourse}
      >
        <Text style={styles.floatingButtonText}>Kurs ändern</Text>
      </TouchableOpacity>
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
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
