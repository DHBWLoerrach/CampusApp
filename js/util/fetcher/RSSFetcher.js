import fetchNewsData from "../../tabs/news/helpers";

export default class RSSFetcher {

    feedUrl;

    constructor(rssFeedURL) {
        this.feedUrl = rssFeedURL;
    }

    async getItems() {
        const response = await fetch(this.feedUrl, {cache: "no-store"});
        if (!response.ok) {
            // server problem
            return null;
        } else {
            const responseBody = await response.text();
            const news = fetchNewsData(responseBody);
            console.log("Loading from " + this.feedUrl);
            return news;
        }
    }

}
