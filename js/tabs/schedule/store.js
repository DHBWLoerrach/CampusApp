import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import FetchManager, {
  DHBW_COURSE,
} from '../../util/fetcher/FetchManager';

export async function loadCourseFromStore() {
  const data = await AsyncStorage.getItem('course');
  return JSON.parse(data);
}

export async function loadRecentCoursesFromStore() {
  const data = await AsyncStorage.getItem('recentCourses');
  return JSON.parse(data);
}

export async function saveCourseToStore(data) {
  AsyncStorage.setItem('course', JSON.stringify(data));
}

export async function saveRecentCoursesToStore(data) {
  AsyncStorage.setItem('recentCourses', JSON.stringify(data));
}

export async function loadScheduleDataFromStore() {
  // clear legacy data (key: lectures) --> changed in August 2023
  await AsyncStorage.removeItem('lectures');
  // TODO: remove previous line after some time passed (e.g. in 2024)
  const course = await AsyncStorage.getItem('course');
  const sections = await AsyncStorage.getItem('lectureSections');
  const calData = await AsyncStorage.getItem('lectureCalData');
  return {
    course: JSON.parse(course),
    lectureSections: JSON.parse(sections),
    lectureCalData: JSON.parse(calData),
  };
}

export async function saveLecturesToStore(sections, calData) {
  AsyncStorage.setItem('lectureSections', JSON.stringify(sections));
  AsyncStorage.setItem('lectureCalData', JSON.stringify(calData));
}

export async function clearLecturesFromStore() {
  AsyncStorage.removeItem('lectureSections');
  AsyncStorage.removeItem('lectureCalData');
}

export async function fetchLecturesFromWeb(course) {
  const result = await FetchManager.fetch(DHBW_COURSE, true, {
    course,
  });

  if (result.status !== 'ok') return result;

  return {
    lectureSections: groupLecturesByDate(result.lectures),
    lectureCalData: result.lectures,
    status: result.status,
  };
}

function groupLecturesByDate(lectures) {
  const resultObj = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set to midnight to compare only dates

  lectures.forEach((item) => {
    // only take lectures from today on
    if (item.startDate < today) return;
    const day = format(item.startDate, 'EEEE dd.MM.yy', {
      locale: de,
    });
    if (!resultObj[day]) resultObj[day] = [];
    resultObj[day].push(item);
  });

  const resultArray = Object.keys(resultObj).map((date) => {
    return { title: date, data: resultObj[date] };
  });

  return resultArray;
}
