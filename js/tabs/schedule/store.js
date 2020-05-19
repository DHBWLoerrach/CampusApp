import AsyncStorage from '@react-native-community/async-storage';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import FetchManager, {DHBW_COURSE} from "../../util/fetcher/FetchManager";

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
  const result = await FetchManager.fetch(DHBW_COURSE, true, {course});

  //Get all dates
  const dates = [];
  result.forEach(lecture => {
    const day = getDay(lecture.startDate);
    if (!dates.includes(day)) {
      dates.push(day);
    }
  });

  const schedule = [];
  dates.forEach(date => {
    schedule.push({
      title: date,
      data: result.filter(lecture => date === getDay(lecture.startDate))
    });
  });
  return schedule;
}


export function getDay(startDate) {
  return format(startDate, 'EEEE dd.MM.yy', {
    locale: de
  });
}
