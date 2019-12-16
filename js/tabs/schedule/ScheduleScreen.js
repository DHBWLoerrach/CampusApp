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
  clearLecturesFromStore,
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

  // load fresh data from web and store it locally
  async function refresh(course) {
    setLoading(true);
    setNetworkError(false);
    const data = await fetchLecturesFromWeb(course);
    if (data === 'networkError') {
      setNetworkError(true);
    } else {
      saveLecturesToStore(data);
      setLectures(data);
    }
    setLoading(false);
  }

  async function clearLecturesAndRefresh(course) {
    await clearLecturesFromStore();
    refresh(course);
  }

  // load data from local store or from web if store is emtpy
  async function loadData() {
    let { course, lectures } = await loadScheduleDataFromStore();
    if (course !== null) {
      setCourse(course);
    }
    if (lectures !== null) {
      setLectures(lectures);
    } else await refresh(course);
    setLoading(false);
  }

  // load data when this component is mounted
  useEffect(() => {
    if (lectures === null) loadData();
  }, []);

  // when screen is focussed, update data from web if new course given or today > first day in lectures
  useFocusEffect(
    useCallback(() => {
      // TODO: force refresh if today > first day in schedule
      loadData();
    }, [])
  );

  // TODO: update header with course name

  // componentDidMount() {
  //   let course = this.props.course;
  //   // set title to course when this screen component mounts...
  //   this.props.navigation.setParams({ course: course });
  //   // ...and everytime we navigate to this screen
  //   this._navListener = this.props.navigation.addListener(
  //     'didFocus',
  //     () => {
  //       // get current course from redux store
  //       let course = this.props.course;
  //       this.props.navigation.setParams({ course });
  //       // Look for new data: fetch lectures without clearing them before
  //       if (course) this.props.dispatch(fetchLectures(course));
  //     }
  //   );
  // }

  // componentWillUnmount() {
  //   this._navListener.remove();
  // }

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
        <ReloadView
          buttonText={buttonText}
          onPress={() => refresh(course)}
        />
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
          onPress={() => refresh(course)}
        />
      </View>
    );
  }

  // contenInset: needed for last item to be displayed above tab bar on iOS
  return (
    <View style={styles.container}>
      <SectionList
        sections={lectures}
        onRefresh={() => clearLecturesAndRefresh(course)}
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
  const headerTitle = navigation.getParam('course', 'Vorlesungsplan');
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
