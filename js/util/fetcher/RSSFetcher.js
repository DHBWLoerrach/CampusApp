import fetchNewsData from '../../tabs/news/helpers';

export default class RSSFetcher {
  feedUrl;

  constructor(rssFeedURL) {
    this.feedUrl = rssFeedURL;
  }

  async getItems() {
    //needed because of bad cache behavior
    const suffix = '?' + new Date().getTime();
    const response = await fetch(this.feedUrl + suffix, {
      cache: 'no-store',
    });
    if (!response.ok) {
      // server problem
      return null;
    } else {
      const responseBody = await response.text();
      const news = fetchNewsData(responseBody);
      console.log('Loading from ' + this.feedUrl + suffix);
      return news;
    }
  }
}
