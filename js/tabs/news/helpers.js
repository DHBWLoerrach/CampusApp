const websiteUrl = 'https://www.dhbw-loerrach.de/';

import { DOMParser } from 'xmldom';

export default function fetchNewsData(newsXMLData) {
  var domParser = new DOMParser();
  var xmlDOM = domParser.parseFromString(newsXMLData, "application/xml");
  var newsItems = xmlDOM.getElementsByTagName('item');
  var newsList = [];
  for(var i = 0; i < newsItems.length; i++) {
    var newsItem = newsItems.item(i);
    var newsContent = "", newsImage = null;

    // there is one content:encoded element per news item
    var contentElement = newsItem.getElementsByTagName('content:encoded').item(0);

    // the content:encoded element has CDATA children
    // but only non-empty ones are contained in the childNode list of contentElement
    var cdataElements = contentElement.childNodes;
    for(var j = 0; j < cdataElements.length; j++) {
      var cdataElem = cdataElements.item(j);
      // check if CDATA element contains a file attribute
      var imageFileAttribute = cdataElem.nodeValue.match(/(file=)(.*?)(?=")/g);
      // a CDATA element may contain an image element or just text
      if(imageFileAttribute !== null) {
        newsImage = websiteUrl + imageFileAttribute[0].substring(5);
      } else {
        newsContent += cdataElem.nodeValue;
      }
    }

    // news time is in format 'ddd, D MMM YYYY HH:mm:ss ZZ', so use Date object
    const time = new Date(newsItem.getElementsByTagName('pubDate').item(0).childNodes.item(0).nodeValue);

    // description element can be empty
    const description = newsItem.getElementsByTagName('description').item(0).childNodes.item(0);
    newsList.push({
      id: i,
      heading: newsItem.getElementsByTagName('title').item(0).childNodes.item(0).nodeValue,
      subheading: description ? description.nodeValue : null,
      // TODO: use this to open news in browser (e.g. Safari on iOS)?
      // when used, add url to NewsItem type
      // url: newsItem.getElementsByTagName('link').item(0).childNodes.item(0).nodeValue,
      time: time,
      imgUrl: newsImage,
      body: newsContent,
    });
   };

  return newsList;
}
