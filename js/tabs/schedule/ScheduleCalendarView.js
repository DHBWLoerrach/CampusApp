import { useContext, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { TimelineCalendar, MomentConfig } from '@howljs/calendar-kit';
import 'moment/locale/de'; // needed by calendar-kit, otherwise ScheduleScreen crashes in release builds!1!
import Styles from '../../Styles/StyleSheet';
import { dhbwRed } from '../../Styles/Colors';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import { LecturesContext } from '../../context/LecturesContext';

MomentConfig.updateLocale('de', {
  weekdaysShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
});

function onEventPress(event) {
  const daysOfWeek = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];
  const monthsOfYear = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  const start = new Date(event.start);
  const dayOfWeek = daysOfWeek[start.getDay()];
  const day = start.getDate().toString().padStart(2, '0');
  const month = monthsOfYear[start.getMonth()];
  const hours = start.getHours().toString().padStart(2, '0');
  const minutes = start.getMinutes().toString().padStart(2, '0');

  const end = new Date(event.end);
  const endHours = end.getHours().toString().padStart(2, '0');
  const endMinutes = end.getMinutes().toString().padStart(2, '0');

  let body = `${dayOfWeek}, ${day}. ${month} · ${hours}:${minutes} - ${endHours}:${endMinutes} ${'\n'} ${event.location}`;
  Alert.alert(event.title_heading, body);
}

function ScheduleCalendarView({ viewMode = 'week' }) {
  const [calHeading, setCalHeading] = useState('');
  const colorContext = useContext(ColorSchemeContext);
  const { lectureCalData, isLoading } = useContext(LecturesContext);

  const calendarRef = useRef(null);

  const calendar = useMemo(() => {
    const weekViewLectures = lectureCalData?.map(
      ({ startDate, startTime, endTime, title, key, location }) => {
        const endDate = new Date(startDate);
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        const formattedTitle = (
          <>
            <Text style={{ fontWeight: 'bold' }}>
              {title}
              {'\n'}
            </Text>
            <Text>{`${startTime} bis ${endTime} \n`}</Text>
            <Text>{location}</Text>
          </>
        );

        return {
          id: key,
          title: formattedTitle,
          title_heading: title,
          location: location,
          color: dhbwRed,
          start: startDate,
          end: endDate,
        };
      }
    );

    return (
      <View style={{ flex: 1 }}>
        <TimelineCalendar
          ref={calendarRef}
          viewMode={viewMode}
          locale="de"
          events={weekViewLectures}
          isLoading={isLoading}
          onPressEvent={onEventPress}
          theme={{
            //today style
            todayName: { color: colorContext.colorScheme.dhbwRed },
            todayNumber: { color: 'white' },
            todayNumberContainer: {
              backgroundColor: colorContext.colorScheme.dhbwRed,
            },
            //normal style
            dayName: { color: colorContext.colorScheme.text },
            dayNumber: { color: colorContext.colorScheme.tabBarText },
            dayNumberContainer: {
              backgroundColor:
                colorContext.colorScheme.scheduleHeader,
            },
            //Saturday style
            saturdayName: {
              color: colorContext.colorScheme.dhbwGray,
            },
            saturdayNumber: {
              color: colorContext.colorScheme.dhbwGray,
            },
            saturdayNumberContainer: {
              backgroundColor:
                colorContext.colorScheme.scheduleHeader,
            },
            //Sunday style
            sundayName: { color: colorContext.colorScheme.dhbwGray },
            sundayNumber: {
              color: colorContext.colorScheme.dhbwGray,
            },
            sundayNumberContainer: {
              backgroundColor:
                colorContext.colorScheme.scheduleHeader,
            },
            allowFontScaling: false,
            nowIndicatorColor: colorContext.colorScheme.dhbwRed,
            eventTitle: { color: 'white' },
            loadingBarColor: colorContext.colorScheme.dhbwRed,
            backgroundColor: colorContext.colorScheme.background,
            cellBorderColor: colorContext.colorScheme.cellBorder,
            hourText: { color: colorContext.colorScheme.text },
          }}
          showNowIndicator={false}
          scrollToNow={false}
          timeZone={'Europe/Berlin'}
          start={6}
          end={21}
          onChange={(date) => {
            // set date in header of calendar to current month and year like: "September 2020"
            date = new Date(date.date);
            const monthsOfYear = [
              'Januar',
              'Februar',
              'März',
              'April',
              'Mai',
              'Juni',
              'Juli',
              'August',
              'September',
              'Oktober',
              'November',
              'Dezember',
            ];
            const month = monthsOfYear[date.getMonth()];
            const year = date.getFullYear();
            setTimeout(() => setCalHeading(`${month} ${year}`), 100);
          }}
        />
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
          fontSize: 12,
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
          padding: 5,
          backgroundColor: colorContext.colorScheme.scheduleHeader,
        }}
      >
        <Text
          style={{
            color: colorContext.colorScheme.tabBarText,
            fontSize: 12,
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
  return <ScheduleCalendarView viewMode="week" />;
}

export function ScheduleThreeDaysView() {
  return <ScheduleCalendarView viewMode="threeDays" />;
}

export function ScheduleDayView() {
  return <ScheduleCalendarView viewMode="day" />;
}
