import RSSFetcher from './RSSFetcher';
import CacheFetcher from './CacheFetcher';
import ICalFetcher from './ICalFetcher';

export const DHBW_COURSE = 'DHBW_COURSE';
export const DHBW_NEWS = 'DHBW_NEWS';
export const DHBW_EVENTS = 'DHBW_EVENTS';

class FetchManager {
  fetcher = [];

  constructor() {
    this.fetcher[DHBW_NEWS] = new CacheFetcher(
      new RSSFetcher(
        'https://dhbw-loerrach.de/rss-campus-app-aktuell'
      ),
      DHBW_NEWS
    );

    this.fetcher[DHBW_EVENTS] = new CacheFetcher(
      new RSSFetcher(
        'https://dhbw-loerrach.de/rss-campus-app-termine'
      ),
      DHBW_EVENTS
    );

    this.fetcher[DHBW_COURSE] = new CacheFetcher(
      new ICalFetcher(),
      DHBW_COURSE,
      60
    );
  }

  async fetch(dataSource, forceNewData = false, params) {
    return this.fetcher[dataSource].getItems(forceNewData, params);
  }

  async getNewData(dataSource) {
    return this.fetcher[dataSource].getNewItems();
  }
}

export default new FetchManager();
