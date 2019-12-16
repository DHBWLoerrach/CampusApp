import AsyncStorage from '@react-native-community/async-storage';

import fetchNewsData from './helpers';
import { feeds } from '../../util/Constants';

export async function loadNewsFromStore() {
  const data = await AsyncStorage.getItem('news');
  return JSON.parse(data);
}

export function saveNewsToStore(data) {
  AsyncStorage.setItem('news', JSON.stringify(data));
}

export async function fetchNewsFromWeb() {
  let news = {},
    response,
    responseBody;
  try {
    await Promise.all(
      feeds.map(async feed => {
        response = await fetch(`https://www.dhbw-loerrach.de/${feed.id}`);
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
