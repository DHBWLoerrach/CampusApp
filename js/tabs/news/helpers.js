const websiteUrl = 'https://www.dhbw-loerrach.de/';

import { DOMParser } from 'xmldom';

export default function fetchNewsData(newsXMLData) {
  var domParser = new DOMParser();
  var xmlDOM = domParser.parseFromString(newsXMLData, 'application/xhtml');
  var newsItems = xmlDOM.getElementsByTagName('item');
  var newsList = [];
  for (var i = 0; i < newsItems.length; i++) {
    let newsItem = newsItems.item(i);
    let newsContent = '',
      newsImage = null,
      attachments = [];

    // there is one content:encoded element per news item
    var contentElement = newsItem
      .getElementsByTagName('content:encoded')
      .item(0);

    let imageElement = newsItem.getElementsByTagName('imageUri').item(0);
    if (imageElement) {
      const imgElem = imageElement.getElementsByTagName('img');
      if (imgElem.length > 0) {
        newsImage = imgElem.item(0).getAttribute('src');
      }
    }

    // the content:encoded element has CDATA children
    // but only non-empty ones are contained in the childNode list of contentElement
    var cdataElements = contentElement.childNodes;
    for (var j = 0; j < cdataElements.length; j++) {
      var cdataElem = cdataElements.item(j);
      // check if CDATA element contains a file attribute
      var imageFileAttribute = cdataElem.nodeValue.match(
        /(file=)(.*?)(?=")/g
      );
      // a CDATA element may contain an image element or just text
      if (!newsImage && imageFileAttribute !== null) {
        newsImage = websiteUrl + imageFileAttribute[0].substring(5);
      } else {
        newsContent += cdataElem.nodeValue;
      }
    }

    // news time is in format 'ddd, D MMM YYYY HH:mm:ss ZZ', so use Date object
    const time = new Date(
      newsItem
        .getElementsByTagName('pubDate')
        .item(0)
        .childNodes.item(0).nodeValue
    );

    // description element can be empty
    const description = newsItem
      .getElementsByTagName('description')
      .item(0)
      .childNodes.item(0);

    let attachmentElements = newsItem.getElementsByTagName('attachment');
    for (let i = 0; i < attachmentElements.length; i++) {
      let attachment = attachmentElements.item(0);
      const url = attachment
        .getElementsByTagName('attachment-url')
        .item(0)
        .childNodes.item(0).nodeValue;
      const title = attachment
        .getElementsByTagName('attachment-title')
        .item(0)
        .childNodes.item(0).nodeValue;
      const size = attachment
        .getElementsByTagName('attachment-size')
        .item(0)
        .childNodes.item(0).nodeValue;
      attachments.push({ url, title, size });
    }

    newsList.push({
      id: i,
      heading: newsItem
        .getElementsByTagName('title')
        .item(0)
        .childNodes.item(0).nodeValue,
      subheading: description ? description.nodeValue : '',
      // TODO: use this to open news in browser (e.g. Safari on iOS)?
      // when used, add url to NewsItem type
      // url: newsItem.getElementsByTagName('link').item(0).childNodes.item(0).nodeValue,
      time: time,
      imgUrl: newsImage,
      body: newsContent,
      attachments: attachments
    });
  }

  return newsList;
}

export function fetchNewsDataFromFb(fbJsonNewsData) {
  let newsList = [];
  fbJsonNewsData.data.map((newsElem, index) => {
    if (newsElem.description || newsElem.message || newsElem.caption) {
      newsList.push({
        id: index,
        url: newsElem.permalink_url,
        heading:
          _formatHeading(newsElem.caption) ||
          _formatHeading(newsElem.name) ||
          'StuV DHBW News',
        subheading: newsElem.message || newsElem.description || '',
        time: _parseFbDate(newsElem.created_time),
        imgUrl: newsElem.full_picture,
        body: newsElem.description || newsElem.message || ''
      });
    }
  });
  return newsList;
}

function _parseFbDate(fbDate) {
  let dateString =
    fbDate.slice(0, fbDate.length - 2) +
    ':' +
    fbDate.slice(fbDate.length - 2);
  return new Date(dateString);
}

function _formatHeading(heading) {
  if (!heading) {
    return null;
  }
  const regex = /(@\[.*?:\d*:|])/g; // replaces facebook's annotations
  heading = heading.replace(regex, '');

  // Trim heading and add ... when the title is too long
  const maxLength = 75;
  if (heading.length > 75) {
    heading = heading.substring(0, 75);
    heading = heading + '...';
  }

  return heading;
}
