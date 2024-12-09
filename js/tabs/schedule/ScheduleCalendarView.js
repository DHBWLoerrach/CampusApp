import {
  useContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
} from '@howljs/calendar-kit';
import Styles from '../../Styles/StyleSheet';
import { dhbwRed } from '../../Styles/Colors';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import { LecturesContext } from '../../context/LecturesContext';

const initialLocales = {
  de: {
    weekDayShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'), // Text in day header (Sun, Mon, etc.),
    meridiem: { ante: 'am', post: 'pm' }, // Hour format (hh:mm a)
    more: 'mehr', // Text for "more" button (All day events)
  },
};

function getCurrentMonth(date) {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
  });
}

function onEventPress(event) {
  const { dateTime: startTime } = event.start;
  const { dateTime: endTime } = event.end;

  const locale = 'de-DE';
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const timeOptions = { hour: 'numeric', minute: 'numeric' };

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const d = startDate.toLocaleDateString(locale, dateOptions);
  const t = startDate.toLocaleTimeString(locale, timeOptions);
  const t2 = endDate.toLocaleTimeString(locale, timeOptions);

  const body = `${d}\n${t} - ${t2} Uhr\n${event.location}`;
  Alert.alert(event.title, body);
}

function ScheduleCalendarView({ numDays = 5 }) {
  const [calHeading, setCalHeading] = useState(
    getCurrentMonth(new Date())
  );
  const colorContext = useContext(ColorSchemeContext);
  const { lectureCalData, isLoading } = useContext(LecturesContext);

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

  const calendarRef = useRef(null);
  const calendar = useMemo(() => {
    let hasEventsOnSaturday = false;
    const weekViewLectures = lectureCalData?.map(
      ({
        startDate,
        startTime,
        endDate,
        endTime,
        title,
        key,
        location,
      }) => {
        let endDate2 = new Date(endDate);
        if (startDate.toString() === endDate2.toString()) {
          endDate2 = new Date(startDate);
          endDate2.setHours(endTime.split(':')[0]);
          endDate2.setMinutes(endTime.split(':')[1]);
        }
        const startDateObj = new Date(startDate);
        if (startDateObj?.getDay() === 6) hasEventsOnSaturday = true;

        return {
          id: key,
          title,
          location,
          color: dhbwRed,
          start: { dateTime: startDate },
          end: { dateTime: endDate2.toISOString() },
        };
      }
    );

    // fall back to week mode if there are events on Saturday
    const days = numDays === 5 && hasEventsOnSaturday ? 6 : numDays;
    return (
      <View style={{ flex: 1 }}>
        <CalendarContainer
          numberOfDays={days}
          scrollByDay={false}
          hideWeekDays={hasEventsOnSaturday ? [7] : [6, 7]}
          allowPinchToZoom={true}
          ref={calendarRef}
          initialLocales={initialLocales}
          locale="de"
          events={weekViewLectures}
          isLoading={isLoading}
          onPressEvent={onEventPress}
          theme={{
            colors: {
              background: colorContext.colorScheme.background,
              border: colorContext.colorScheme.veryLightGray,
            },
            nowIndicatorColor: 'blue',
            headerBackgroundColor:
              colorContext.colorScheme.background,
            hourTextStyle: { color: colorContext.colorScheme.text },
            hourBackgroundColor: colorContext.colorScheme.background,
            todayName: { color: colorContext.colorScheme.dhbwRed },
            todayNumber: { color: 'white' },
            todayNumberContainer: {
              backgroundColor: colorContext.colorScheme.dhbwRed,
            },
            dayName: { color: colorContext.colorScheme.text },
            dayNumber: { color: colorContext.colorScheme.tabBarText },
            dayNumberContainer: {
              backgroundColor:
                colorContext.colorScheme.scheduleHeader,
            },
          }}
          scrollToNow={false}
          timeZone={'Europe/Berlin'}
          start={420}
          end={1200}
          onChange={(date) => {
            setTimeout(
              () => setCalHeading(getCurrentMonth(date)),
              100
            );
          }}
        >
          <CalendarHeader />
          <CalendarBody renderEvent={renderEvent} />
        </CalendarContainer>
      </View>
    );
  }, [isLoading, colorContext.colorScheme]);

  const GoToToday = () => (
    <Pressable
      onPress={() => {
        calendarRef.current?.goToDate({ animatedDate: true });
      }}
    >
      <Text
        style={{
          color: colorContext.colorScheme.dhbwRed,
          fontSize: 14,
        }}
      >
        Heute
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        Styles.ScheduleScreen.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 4,
          backgroundColor: colorContext.colorScheme.scheduleHeader,
        }}
      >
        <Text
          style={{
            color: colorContext.colorScheme.tabBarText,
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {calHeading}
        </Text>
        <GoToToday />
      </View>
      {calendar}
    </View>
  );
}

export function ScheduleWeekView() {
  return <ScheduleCalendarView numDays={5} />;
}

export function ScheduleDayView() {
  return <ScheduleCalendarView numDays={1} />;
}
