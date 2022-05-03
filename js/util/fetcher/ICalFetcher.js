import getLecturesFromiCalData from '../../tabs/schedule/helpers';

export default class ICalFetcher {
  async getItems(params) {
    let lectures = null,
      status = 'ok';
    try {
      //needed because of bad cache behavior
      const suffix = '?' + new Date().getTime();
      const scheduleUrl = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${params.course}@dhbw-loerrach.de/Kalender/calendar.ics${suffix}`;
      const response = await fetch(scheduleUrl, {
        cache: 'no-store',
      });
      if (response.status === 503) {
        status = 'serviceUnavailable';
      } else if (response.status !== 200) {
        status = 'not ok';
      } else {
        const responseBody = await response.text();
        lectures = getLecturesFromiCalData(responseBody);
      }
    } catch (error) {
      return { lectures: null, status: 'networkError' };
    }
    return { lectures, status };
  }
}
