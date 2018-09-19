import fetchNewsData from './helpers';
import { feeds } from '../../util/Constants';
import { fbAccessToken } from '../../../env.js';
import { fetchNewsDataFromFb } from './helpers';

// ACTIONS
// action that is dispatched whenever the news will we fetched
const REQUEST_NEWS = 'REQUEST_NEWS';

export function requestNews() {
  return {
    type: REQUEST_NEWS
  };
}

// action that is dispatched whenever fetching the news finished
const RECEIVE_NEWS = 'RECEIVE_NEWS';

export function receiveNews(news) {
  return {
    type: RECEIVE_NEWS,
    news: news,
    receivedAt: Date.now()
  };
}

// action that is dispatched whenever an error occurred while fetching the news data
const ERROR_FETCHING_NEWS = 'ERROR_FETCHING_NEWS';

export function errorFetchingNews() {
  return {
    type: ERROR_FETCHING_NEWS,
    news: {}
  };
}

export function fetchNews() {
  // a function as actions (enabled by thunk)
  return async function(dispatch) {
    dispatch(requestNews());
    try {
      let response, responseBody;
      let newsItems = {};
      await Promise.all(
        feeds.map(async feed => {
          if (feed.name == 'StuV') {
            response = await fetch(
              'https://graph.facebook.com/' +
                feed.key +
                '/posts?fields=message,full_picture,caption,description,name,story,created_time,permalink_url&limit=10&access_token=' +
                fbAccessToken
            );
            responseBody = await response.json();
            newsItems[feed.key] = fetchNewsDataFromFb(responseBody);
          } else {
            response = await fetch(
              `https://www.dhbw-loerrach.de/index.php?id=${feed.id}`
            );
            responseBody = await response.text();
            newsItems[feed.key] = fetchNewsData(responseBody);
          }
        })
      );
      dispatch(receiveNews(newsItems));
    } catch (e) {
      console.log(e);
      dispatch(errorFetchingNews());
    }
  };
}

// REDUCER
export function news(
  state = {
    isFetching: false,
    networkError: false,
    lastUpdated: null,
    news: []
  },
  action
) {
  switch (action.type) {
    case REQUEST_NEWS:
      return {
        ...state,
        isFetching: true,
        networkError: false
      };
    case RECEIVE_NEWS:
      return {
        ...state,
        isFetching: false,
        news: action.news,
        networkError: false,
        lastUpdated: action.receivedAt
      };
    case ERROR_FETCHING_NEWS:
      return {
        ...state,
        isFetching: false,
        networkError: true
      };
    default:
      return state;
  }
}
