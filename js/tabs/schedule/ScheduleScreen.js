import React, { useCallback, useContext, useState } from 'react';
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
import WeekView from 'react-native-week-view';
import { dhbwGray, dhbwRed } from '../../Styles/Colors';
import moment from 'moment';
import 'moment/locale/de'
import { ScheduleModeContext } from '../../context/ScheduleModeContext';

function ScheduleScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true);
  const [status, setStatus] = useState('ok');
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState(null);
  const [searchString, setSearchString] = useState('');
  const ref = React.useRef(null);
  const colorContext = useContext(ColorSchemeContext);
  const scheduleMode = useContext(ScheduleModeContext);
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
      moment.locale('de')
    }, [])
  );

  if (isLoading) {
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
  if (
    !Array.isArray(lectures) &&
    (status === 'networkError' || status === 'not ok')
  ) {
    return (
      <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>
        <ReloadView buttonText={buttonText} onPress={loadData} />
      </View>
    );
  }

  if (!Array.isArray(lectures) && status === 'serviceUnavailable') {
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

  if (!Array.isArray(lectures) || !lectures.length) {
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

  const weekViewLectures = [];
  lectures.forEach((lectureGroup, index) => {
    lectureGroup.data.forEach((lecture, lectureIndex) => {
      let startDate = new Date(lecture.startDate);
      let endDate = new Date(lecture.startDate);
      endDate.setHours(lecture.endTime.split(':')[0]);
      endDate.setMinutes(lecture.endTime.split(':')[1]);
      weekViewLectures.push({
        id: lecture.key,
        title: lecture.title,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        location: lecture.location,
        color: dhbwRed,
        startDate: startDate,
        endDate: endDate,
      });
    });
  });

  // Highlight today with a bold font
  const MyTodayComponent = ({ formattedDate, textStyle }) => (
    <View style={{ borderRadius: 10, backgroundColor: dhbwRed }}>
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
    let body = `${event.startTime} bis ${event.endTime} ${'\n'} ${event.location}`;
    Alert.alert(event.title, body);
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
      <WeekView
        locale='de'
        events={weekViewLectures}
        numberOfDays={scheduleMode}
        selectedDate={new Date()}
        showNowLine={true}
        nowLineColor={dhbwGray}
        allowScrollByDay={true}
        hoursInDisplay={12}
        startHour={8}
        timeStep={60}
        formatDateHeader={'dd D.MM'}
        eventContainerStyle={{ borderTopRightRadius: 10, borderBottomRightRadius: 10, margin: 0, alignItems: 'flex-start', padding: 5 }}
        EventComponent={EventComponent}
        TodayHeaderComponent={MyTodayComponent}
        headerStyle={{ borderColor: 'white' }}
        onMonthPress={loadData}
        onEventPress={OnEventPress}
      />
    </>
  }
  // contenInset: needed for last item to be displayed above tab bar on iOS
  return (
    <View style={[Styles.ScheduleScreen.container, { backgroundColor: colorContext.colorScheme.background }]}>{body}</View>
  );
}

export default ScheduleScreen;
