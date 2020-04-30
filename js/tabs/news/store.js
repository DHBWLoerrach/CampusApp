import AsyncStorage from '@react-native-community/async-storage';

import fetchNewsData from './helpers';
import { feeds } from '../../util/Constants';

export async function loadNewsFromStore() {
  const data = await AsyncStorage.getItem('news');
  if (data == null) {
    return null;
  }

  const parsedData = JSON.parse(data);

  //Backwards compatibility
  if (!('lastfetch' in parsedData)) {
    return null;
  }

  //Deliver no data if older than 60 minutes
  if (new Date().getTime() > parsedData.lastfetch + 60 * 60 * 1000) {
    return null;
  }
  return parsedData.news;
}

export function saveNewsToStore(news) {
  const dataToSave = {
    lastfetch: new Date().getTime(),
    news,
  };
  AsyncStorage.setItem('news', JSON.stringify(dataToSave));
}

export async function fetchNewsFromWeb() {
  let news = {},
    response,
    responseBody;
  try {
    await Promise.all(
      feeds.map(async (feed) => {
        response = await fetch(
          `https://www.dhbw-loerrach.de/${feed.id}`
        );
        if (!response.ok) {
          // server problem for a particular feed
          news[feed.key] = null;
        } else {
          responseBody = await response.text();
          news[feed.key] = fetchNewsData(responseBody);
        }
      })
    );
  } catch (e) {
    return 'networkError';
  }
  return news;
}
