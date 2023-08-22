import { webmailUrl } from '../../util/Constants';
import getLecturesFromiCalData from '../../tabs/schedule/helpers';

export default class ICalFetcher {
  async getItems(params) {
    let lectures = null,
      status = 'ok';
    try {
      //needed because of bad cache behavior
      const suffix = '?' + new Date().getTime();
      const scheduleUrl = `${webmailUrl(params.course)}${suffix}`;
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
      console.log('Error fetching webmail calendar', error);
      return { lectures: null, status: 'networkError' };
    }
    return { lectures, status };
  }
}
