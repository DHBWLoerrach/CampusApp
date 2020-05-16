import RSSFetcher from "./RSSFetcher";
import CacheFetcher from "./CacheFetcher";

export const DHBW_NEWS = "DHBW_NEWS";
export const DHBW_EVENTS = "DHBW_EVENTS";

class FetchManager {

    fetcher = [];

    constructor() {
        this.fetcher[DHBW_NEWS] = new CacheFetcher(
            new RSSFetcher("https://dhbw-loerrach.de/rss-campus-app-aktuell"),
            DHBW_NEWS
        );

        this.fetcher[DHBW_EVENTS] = new CacheFetcher(
          new RSSFetcher("https://dhbw-loerrach.de/rss-campus-app-termine"),
            DHBW_EVENTS
        );
    }

    async fetch(dataSource, forceNewData = false) {
        return this.fetcher[dataSource].getItems(forceNewData);
    }

}

export default new FetchManager();
