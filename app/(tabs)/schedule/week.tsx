import { useCallback, useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  LocaleConfigsProps,
} from '@howljs/calendar-kit';
import Header from '@/components/CalendarHeader';
import { useThemeColor } from '@/hooks/useThemeColor';

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
export default function LecturesWeek() {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);

  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const dayNumberContainer = useThemeColor({}, 'dayNumberContainer');
  const dayTextColor = useThemeColor({}, 'dayTextColor');
  const textColor = useThemeColor({}, 'text');

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

  const onPressEvent = (event) => {
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

    const body = `${d}\n${t} - ${t2} Uhr\n${event.location}`;
    Alert.alert(event.title, body);
  };

  const renderEvent = useCallback(
    (event) => (
      <View style={{ height: '100%', padding: 4 }}>
        <Text
          style={{ fontWeight: 'bold', color: 'white', fontSize: 12 }}
        >
          {event.title}
        </Text>
        <Text style={{ color: 'white', fontSize: 12 }}>
          {event.location}
        </Text>
      </View>
    ),
    []
  );

  return (
    <>
      <Header
        currentDate={currentDate}
        onPressToday={_onPressToday}
        onPressPrevious={onPressPrevious}
        onPressNext={onPressNext}
      />
      <CalendarContainer
        ref={calendarRef}
        onChange={_onChange}
        allowPinchToZoom={true}
        hourWidth={50}
        initialLocales={initialLocales}
        locale="de"
        events={[
          {
            id: '1',
            title: 'Ausschusssitzung',
            start: { dateTime: '2025-07-28T10:00:00+02:00' },
            end: { dateTime: '2025-07-28T11:00:00+02:00' },
          },
          {
            id: '2',
            title: 'Coffee break',
            start: { dateTime: '2025-07-28T15:00:00+02:00' },
            end: { dateTime: '2025-07-28T16:00:00+02:00' },
          },
        ]}
        onPressEvent={onPressEvent}
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
    </>
  );
}
