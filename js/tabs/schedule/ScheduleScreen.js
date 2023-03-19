import React, { useCallback, useContext, useMemo, useState, useRef } from 'react';
import { Button, SectionList, View, Text, Alert } from 'react-native';
import {
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';

import DayHeader from './DayHeader';
import ReloadView from '../../util/ReloadView';
import SearchBar from '../../util/SearchBar';
import ActivityIndicator from '../../util/DHBWActivityIndicator';

import LectureRow from './LectureRow';
import {
  loadScheduleDataFromStore,
  fetchLecturesFromWeb,
  saveLecturesToStore,
} from './store';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from "../../context/ColorSchemeContext";
import { dhbwRed } from '../../Styles/Colors';
import 'moment/locale/de'
import { ScheduleModeContext } from '../../context/ScheduleModeContext';
import { TimelineCalendar, MomentConfig } from '@howljs/calendar-kit';

function ScheduleScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true);
  const [status, setStatus] = useState('ok');
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState(null);
  const [searchString, setSearchString] = useState('');
  const [calHeading, setCalHeading] = useState('');
  const ref = React.useRef(null);
  const colorContext = useContext(ColorSchemeContext);
  const scheduleMode = useContext(ScheduleModeContext);

  const calendar = useMemo(() => {
    if (scheduleMode == 0) return;
    let viewMode;
    if (scheduleMode == 1) {
      viewMode = 'day';
    } else if (scheduleMode == 3) {
      viewMode = 'threeDays';
    } else if (scheduleMode == 5) {
      viewMode = 'workWeek';
    } else {
      viewMode = 'week';
    }
    console.log('rendering calendar');
    const weekViewLectures = [];
    lectures?.forEach((lectureGroup, index) => {
      lectureGroup.data.forEach((lecture, lectureIndex) => {
        let startDate = new Date(lecture.startDate);
        let endDate = new Date(lecture.startDate);
        endDate.setHours(lecture.endTime.split(':')[0]);
        endDate.setMinutes(lecture.endTime.split(':')[1]);
        const formattedTitle = (
          <>
            <Text style={{ fontWeight: 'bold' }}>{lecture.title}{'\n'}</Text>
            <Text>{`${lecture.startTime} bis ${lecture.endTime} \n`}</Text>
            <Text>{lecture.location}</Text>
          </>
        );

        weekViewLectures.push({
          id: lecture.key,
          title: formattedTitle,
          title_heading: lecture.title,
          location: lecture.location,
          color: dhbwRed,
          start: startDate,
          end: endDate,
        });
      });
    });

    return (
      <View style={{ flex: 1 }}>
        <TimelineCalendar
          viewMode={viewMode}
          locale='de'
          events={weekViewLectures}
          onPressEvent={OnEventPress}
          isLoading={isLoading}
          theme={{
            //today style
            todayName: { color: colorContext.colorScheme.dhbwRed },
            todayNumber: { color: 'white' },
            todayNumberContainer: { backgroundColor: colorContext.colorScheme.dhbwRed },
            //normal style
            dayName: { color: colorContext.colorScheme.text },
            dayNumber: { color: colorContext.colorScheme.tabBarText },
            dayNumberContainer: { backgroundColor: colorContext.colorScheme.scheduleHeader },
            //Saturday style
            saturdayName: { color: colorContext.colorScheme.dhbwGray },
            saturdayNumber: { color: colorContext.colorScheme.dhbwGray },
            saturdayNumberContainer: { backgroundColor: colorContext.colorScheme.scheduleHeader },
            //Sunday style
            sundayName: { color: colorContext.colorScheme.dhbwGray },
            sundayNumber: { color: colorContext.colorScheme.dhbwGray },
            sundayNumberContainer: { backgroundColor: colorContext.colorScheme.scheduleHeader },

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
            const monthsOfYear = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
            const month = monthsOfYear[date.getMonth()];
            const year = date.getFullYear();
            setTimeout(() => {
              setCalHeading(`${month} ${year}`);
            }, 100);
          }}
        />
      </View>
    );
  }, [isLoading, scheduleMode, colorContext.colorScheme]);
  useScrollToTop(ref);

  // load data: first from local store, then fetch latest data from web
  async function loadData() {
    setLoading(true);
    const dataFromStore = await loadScheduleDataFromStore();
    const courseFromStore = dataFromStore.course;
    const lecturesFromStore = dataFromStore.lectures;
    navigation.setParams({ course: courseFromStore });
    setCourse(courseFromStore);
    setLectures(lecturesFromStore);
    const fetchResult = await fetchLecturesFromWeb(courseFromStore);
    const newLectures = fetchResult.lectures;
    const fetchStatus = fetchResult.status;

    if (fetchStatus === 'ok') {
      // use new lecture data from server and store locally
      setLectures(newLectures);
      saveLecturesToStore(newLectures);
    } else if (!Array.isArray(lectures)) {
      // no lectures in cache and data fetch unsuccessful
      setStatus(fetchStatus);
    }
    setLoading(false);
  }

  function filterLectures(searchString, rawLectures) {
    if (searchString.length === 0 || !rawLectures) {
      return rawLectures;
    }
    //Do not touch downloaded lectures
    const lectures = [...rawLectures];
    searchString = searchString.toLowerCase();
    for (let i = 0; i < lectures.length; i++) {
      //Do not touch original data
      let lecture = Object.assign({}, lectures[i]);
      lecture.data = lecture.data.filter((date) =>
        date.title.toLowerCase().includes(searchString)
      );
      lectures[i] = lecture;
    }
    return lectures.filter((lecture) => lecture.data.length !== 0);
  }

  // when screen is focussed, load data and update header title
  useFocusEffect(
    useCallback(() => {
      //The user expects an empty search bar on re-navigation
      setSearchString('');
      loadData();
      MomentConfig.updateLocale('de', {
        weekdaysShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
      })
    }, [])
  );

  if (isLoading && (scheduleMode == 0 || !course)) {
    return (
      <View style={[Styles.ScheduleScreen.center, { backgroundColor: colorContext.colorScheme.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[Styles.ScheduleScreen.center, { backgroundColor: colorContext.colorScheme.background }]}>
        <Button
          title="Kurs eingeben"
          color={colorContext.colorScheme.dhbwRed}
          onPress={() => navigation.navigate('EditCourse')}
        />
      </View>
    );
  }

  const buttonText = 'Vorlesungsplan laden';
  if (!isLoading &&
    (
      !Array.isArray(lectures) &&
      (status === 'networkError' || status === 'not ok')
    )
  ) {
    return (
      <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>
        <ReloadView buttonText={buttonText} onPress={loadData} />
      </View>
    );
  }

  if (!isLoading &&
    (
      !Array.isArray(lectures) &&
      status === 'serviceUnavailable'
    )
  ) {
    const text =
      'Der Kurskalender konnte nicht geladen werden, weil es ein Problem mit dem Webmail-Server gibt.';
    return (
      <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>
        <ReloadView
          message={text}
          buttonText={buttonText}
          onPress={loadData}
        />
      </View>
    );
  }

  if (!isLoading &&
    (
      !Array.isArray(lectures) ||
      !lectures.length
    )
  ) {
    const text =
      'Aktuell sind für Kurs ' +
      course +
      ' keine Termine ' +
      'vorhanden oder Dein Studiengang veröffentlicht keine Termine online.';
    return (
      <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>
        <ReloadView
          message={text}
          buttonText={buttonText}
          onPress={loadData}
        />
      </View>
    );
  }

  // Highlight today with a bold font
  const MyTodayComponent = ({ formattedDate, textStyle }) => (
    <View style={{ borderRadius: 10, backgroundColor: colorContext.colorScheme.dhbwRed }}>
      <Text style={[textStyle, { fontWeight: 'bold', color: 'white', padding: 5 }]}>{formattedDate}</Text>
    </View>
  );

  const EventComponent = ({ event }) => (
    <Text style={{ textAlign: 'left', color: 'white' }} >
      <Text style={{ fontWeight: 'bold' }}>{event.title}</Text>{'\n'}
      <Text>{event.startTime} bis {event.endTime}</Text>{'\n'}
      <Text>{event.location}</Text>
    </Text>
  );

  function OnEventPress(event) {
    const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    const monthsOfYear = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

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

  let body;
  if (scheduleMode == 0) {
    body = <>
      <SearchBar
        onSearch={(text) => setSearchString(text)}
        searchString={searchString}
      />
      <SectionList
        sections={filterLectures(searchString, lectures)}
        ref={ref}
        onRefresh={loadData}
        refreshing={isLoading}
        renderItem={({ item }) => <LectureRow lecture={item} />}
        renderSectionHeader={({ section }) => (
          <DayHeader title={section.title} />
        )}
      />
    </>;
  } else {
    body = <>
      <View style={{ alignItems: 'center', padding: 5, backgroundColor: colorContext.colorScheme.scheduleHeader }}>
        <Text style={{ color: colorContext.colorScheme.tabBarText, fontSize: 12 }}>{calHeading}</Text>
      </View>
      {calendar}
    </>
  }
  // contenInset: needed for last item to be displayed above tab bar on iOS
  return (
    <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>{body}</View>
  );
}

export default ScheduleScreen;
