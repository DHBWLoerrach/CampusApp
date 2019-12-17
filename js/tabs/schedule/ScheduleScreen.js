import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SectionList,
  StyleSheet,
  View
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useNavigationEvents
} from 'react-navigation-hooks';

import Colors from '../../util/Colors';
import DayHeader from '../../util/DayHeader';
import HeaderIcon from '../../util/HeaderIcon';
import ReloadView from '../../util/ReloadView';

import LectureRow from './LectureRow';
import {
  loadScheduleDataFromStore,
  fetchLecturesFromWeb,
  saveLecturesToStore
} from './store';

function ScheduleScreen() {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState(null);

  const { navigate, setParams } = useNavigation();

  // load data: first from local store, then fetch latest data from web
  async function loadData() {
    setLoading(true);
    setNetworkError(false);
    let { course, lectures } = await loadScheduleDataFromStore();
    setCourse(course);
    setLectures(lectures);
    const newLectures = await fetchLecturesFromWeb(course);
    if (newLectures === 'networkError' && lectures === null) {
      // new lectures in store and server not reachable
      setNetworkError(true);
    } else if (newLectures !== 'networkError') {
      // use new lecture data from server and store locally
      setLectures(newLectures);
      saveLecturesToStore(newLectures);
    }
    setLoading(false);
  }

  // when screen is focussed, load data
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useNavigationEvents(event => {
    // after focus, update navigation params to set header title to course (see bottom of file)
    async function loadCourseAndSetParam() {
      let { course } = await loadScheduleDataFromStore();
      setParams({ course: course });
    }
    if (event.type === 'didFocus') loadCourseAndSetParam();
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.center}>
        <Button
          title="Kurs eingeben"
          color={Colors.dhbwRed}
          onPress={() => navigate('EditCourse')}
        />
      </View>
    );
  }

  const buttonText = 'Vorlesungsplan laden';
  if (!lectures && hasNetworkError) {
    return (
      <View style={styles.container}>
        <ReloadView buttonText={buttonText} onPress={loadData} />
      </View>
    );
  }

  if (lectures && !lectures.length) {
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
      <SectionList
        sections={lectures}
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
    backgroundColor: 'white'
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

ScheduleScreen.navigationOptions = ({ navigation }) => {
  let headerTitle = navigation.getParam('course', 'Vorlesungsplan');
  return {
    headerRight: (
      <HeaderIcon
        onPress={() => navigation.navigate('EditCourse')}
        icon="edit"
      />
    ),
    headerTitle
  };
};

export default ScheduleScreen;
