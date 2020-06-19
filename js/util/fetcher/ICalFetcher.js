import getLecturesFromiCalData from '../../tabs/schedule/helpers';

export default class ICalFetcher {
  async getItems(params) {
    let lectures = null;
    try {
      //needed because of bad cache behavior
      const suffix = '?' + new Date().getTime();
      const scheduleUrl = `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${params.course}@dhbw-loerrach.de/Kalender/calendar.ics${suffix}`;
      console.log('Loading from ' + scheduleUrl);
      const response = await fetch(scheduleUrl, {
        cache: 'no-store',
      });
      if (response.status !== 200) {
        return null;
      }
      const responseBody = await response.text();
      lectures = getLecturesFromiCalData(responseBody);
    } catch (error) {
      console.log(error);
      return 'networkError';
    }
    return lectures;
  }
}
