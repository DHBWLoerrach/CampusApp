import AsyncStorage from '@react-native-community/async-storage';

import getLecturesFromiCalData from './helpers';

export async function loadScheduleDataFromStore() {
  const lectures = await AsyncStorage.getItem('lectures');
  const course = await AsyncStorage.getItem('course');
  return { course: JSON.parse(course), lectures: JSON.parse(lectures) };
}

export async function saveLecturesToStore(data) {
  AsyncStorage.setItem('lectures', JSON.stringify(data));
}

export async function loadCourseFromStore() {
  const data = await AsyncStorage.getItem('course');
  return JSON.parse(data);
}

export async function saveCourseToStore(data) {
  AsyncStorage.setItem('course', JSON.stringify(data));
}

export async function clearLecturesFromStore() {
  AsyncStorage.removeItem('lectures');
}

export async function fetchLecturesFromWeb(course) {
  let lectures = null;
  try {
    const scheduleUrl = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;
    const response = await fetch(scheduleUrl);
    const responseBody = await response.text();
    lectures = getLecturesFromiCalData(responseBody);
  } catch (error) {
    return 'networkError';
  }
  return lectures;
}
