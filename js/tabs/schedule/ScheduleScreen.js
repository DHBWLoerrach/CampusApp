import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import {
  loadScheduleDataFromStore,
  fetchLecturesFromWeb,
  saveLecturesToStore,
} from './store';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import { LecturesContext } from '../../context/LecturesContext';
import { useReloadData } from '../../context/ReloadContext';
import Styles from '../../Styles/StyleSheet';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import ReloadView from '../../util/ReloadView';
import ScheduleSectionListView from './ScheduleSectionListView';
import {
  ScheduleWeekView,
  ScheduleThreeDaysView,
  ScheduleDayView,
} from './ScheduleCalendarView';

const Tab = createMaterialTopTabNavigator();

export default function ScheduleScreen({ navigation }) {
  const [isLoading, setLoading] = useState(true);
  const [status, setStatus] = useState('ok');
  const [course, setCourse] = useState(null);
  const [lectureSections, setLectureSections] = useState(null); // TODO: []?
  const [lectureCalData, setLectureCalData] = useState(null); // TODO: []?

  const colorContext = useContext(ColorSchemeContext);
  const { reload, setReload } = useReloadData();

  // when screen is focussed, load data and update header title
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (reload) {
      loadData();
      setReload(false);
    }
  }, [reload]);

  // load data: first from local store, then fetch latest data from web
  async function loadData() {
    setLoading(true);
    const dataFromStore = await loadScheduleDataFromStore();
    const courseFromStore = dataFromStore.course;
    const lectureSectionsFromStore = dataFromStore.lectureSections;
    const lectureCalDataFromStore = dataFromStore.lectureCalData;
    navigation.setParams({ course: courseFromStore });
    setCourse(courseFromStore);
    setLectureSections(lectureSectionsFromStore);
    setLectureCalData(lectureCalDataFromStore);
    const fetchResult = await fetchLecturesFromWeb(courseFromStore);
    const newLectureSections = fetchResult.lectureSections;
    const newLectureCalData = fetchResult.lectureCalData;
    const fetchStatus = fetchResult.status;

    if (fetchStatus === 'ok') {
      // use new lecture data from server and store locally
      await saveLecturesToStore(
        newLectureSections,
        newLectureCalData
      );
      setLectureSections(newLectureSections);
      setLectureCalData(newLectureCalData);
    } else if (!Array.isArray(newLectureSections)) {
      // TODO: is this if needed? to be changed?
      // no lectures in cache and data fetch unsuccessful
      setStatus(fetchStatus);
    }
    setLoading(false);
  }

  let noContent = null;

  if (isLoading && !course) {
    noContent = <ActivityIndicator />;
  } else if (!course) {
    noContent = (
      <Button
        title="Kurs eingeben"
        color={colorContext.colorScheme.dhbwRed}
        onPress={() => navigation.navigate('EditCourse')}
      />
    );
  } else if (
    !isLoading &&
    !Array.isArray(lectureSections) &&
    status !== 'ok'
  ) {
    noContent = (
      <ReloadView
        buttonText="Vorlesungsplan laden"
        onPress={loadData}
      />
    );
  } else if (
    !isLoading &&
    (!Array.isArray(lectureSections) || !lectureSections.length)
  ) {
    noContent = (
      <ReloadView
        message={`Aktuell sind für den Kurs ${course} keine Termine vorhanden oder dieser Studiengang veröffentlicht keine Termine online.`}
        buttonText="Vorlesungsplan laden"
        onPress={loadData}
      />
    );
  }

  if (noContent) {
    return (
      <View
        style={[
          Styles.ScheduleScreen.center,
          { backgroundColor: colorContext.colorScheme.background },
        ]}
      >
        {noContent}
      </View>
    );
  }

  return (
    <LecturesContext.Provider
      value={{ lectureSections, lectureCalData, loadData, isLoading }}
    >
      <Tab.Navigator
        screenOptions={{
          swipeEnabled: false,
          ...Styles.General.topTabBar,
        }}
      >
        <Tab.Screen
          name="Liste"
          component={ScheduleSectionListView}
        />
        <Tab.Screen name="Woche" component={ScheduleWeekView} />
        <Tab.Screen name="3 Tage" component={ScheduleThreeDaysView} />
        <Tab.Screen name="1 Tag" component={ScheduleDayView} />
      </Tab.Navigator>
    </LecturesContext.Provider>
  );
}
