import React, { useCallback, useState } from 'react';
import { Button, SectionList, StyleSheet, View } from 'react-native';
import {
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';

import Colors from '../../util/Colors';
import DayHeader from '../../util/DayHeader';
import ReloadView from '../../util/ReloadView';
import SearchBar from '../../util/SearchBar';
import ActivityIndicator from '../../util/DHBWActivityIndicator';

import LectureRow from './LectureRow';
import {
  loadScheduleDataFromStore,
  fetchLecturesFromWeb,
  saveLecturesToStore,
} from './store';

function ScheduleScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true);
  const [status, setStatus] = useState('ok');
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState(null);
  const [searchString, setSearchString] = useState('');
  const ref = React.useRef(null);
  useScrollToTop(ref);

  // load data: first from local store, then fetch latest data from web
  async function loadData() {
    setLoading(true);
    const dataFromStore = await loadScheduleDataFromStore();
    const courseFromStore = dataFromStore.course;
    const lecturesFromStore = dataFromStore.lectures;
    setCourse(courseFromStore);
    setLectures(lecturesFromStore);
    const fetchResult = await fetchLecturesFromWeb(course);
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
      async function loadCourseAndSetParam() {
        let { course } = await loadScheduleDataFromStore();
        navigation.setParams({ course: course });
      }
      loadCourseAndSetParam();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.center}>
        <Button
          title="Kurs eingeben"
          color={Colors.dhbwRed}
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
      <View style={styles.container}>
        <ReloadView buttonText={buttonText} onPress={loadData} />
      </View>
    );
  }

  if (!Array.isArray(lectures) && status === 'serviceUnavailable') {
    const text =
      'Der Kurskalender konnte nicht geladen werden, weil es ein Problem mit dem Webmail-Server gibt.';
    return (
      <View style={styles.container}>
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
      <View style={styles.container}>
        <ReloadView
          message={text}
          buttonText={buttonText}
          onPress={loadData}
        />
      </View>
    );
  }

  // contenInset: needed for last item to be displayed above tab bar on iOS
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScheduleScreen;
