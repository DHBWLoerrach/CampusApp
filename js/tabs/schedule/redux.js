// @flow
import getLecturesFromiCalData from './helpers';

// ACTIONS
// action that clears lectures (e.g. after changing course)
const CLEAR_LECTURES = 'CLEAR_LECTURES';

export function clearLectures() {
  return { type: CLEAR_LECTURES };
}

// action that is dispatched whenever a course schedule will we fetched
const REQUEST_COURSE_SCHEDULE = 'REQUEST_COURSE_SCHEDULE';

export function requestCourseSchedule(course) {
  return {
    type: REQUEST_COURSE_SCHEDULE,
    course
  };
}

// action that is dispatched whenever fetching a course schedule finished
const RECEIVE_COURSE_SCHEDULE = 'RECEIVE_COURSE_SCHEDULE';

export function receiveCourseSchedule(course, lectures) {
  return {
    type: RECEIVE_COURSE_SCHEDULE,
    course,
    lectures: lectures
  };
}

// action that is dispatched whenever an error occurred while fetching data
const ERROR_FETCHING_SCHEDULE = 'ERROR_FETCHING_SCHEDULE';

export function errorFetchingSchedule(course) {
  return {
    type: ERROR_FETCHING_SCHEDULE,
    course
  };
}

export function fetchLectures(course) {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return async function(dispatch) {
    // inform App that the API call is starting (a spinner could be shown)
    dispatch(requestCourseSchedule(course));

    try {
      const scheduleUrl =
        'https://webmail.dhbw-loerrach.de/owa/calendar/kal-@course@@dhbw-loerrach.de/Kalender/calendar.ics';
      const scheduleUrlWithCourse = scheduleUrl.replace('@course@', course);

      const response = await fetch(scheduleUrlWithCourse);
      if (response.ok) {
        // calendar found
        const responseBody = await response.text();
        const lectures = getLecturesFromiCalData(responseBody);
        dispatch(receiveCourseSchedule(course, lectures));
      } else {
        // got no response from exchange server, server possibly busy
        dispatch(errorFetchingSchedule(course));
      } // TODO: different error types? (also canteen and news ?)
    } catch (error) {
      // problem with network, dispatch error
      dispatch(errorFetchingSchedule(course));
    }
  };
}

// REDUCER

export function schedule(
  state = {
    course: null,
    isFetching: false,
    networkError: false,
    lectures: null
  },
  action
) {
  switch (action.type) {
    case CLEAR_LECTURES:
      return {
        ...state,
        lectures: null
      };
    case REQUEST_COURSE_SCHEDULE:
      return {
        ...state,
        course: action.course,
        isFetching: true,
        networkError: false
      };
    case RECEIVE_COURSE_SCHEDULE:
      return {
        ...state,
        isFetching: false,
        lectures: action.lectures,
        networkError: false
      };
    case ERROR_FETCHING_SCHEDULE:
      return {
        ...state,
        isFetching: false,
        networkError: true
      };
    default:
      return state;
  }
}
