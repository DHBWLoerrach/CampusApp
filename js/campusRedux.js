// @flow
'use strict';

import {
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import thunk from 'redux-thunk'; // thunk middleware to use functions as actions
import { fetchNewsData } from './util/helpers';

// ACTIONS

// action that is dispatched whenever the news will we fetched
export const REQUEST_NEWS = 'REQUEST_NEWS';

export function requestNews() {
  return {
    type: REQUEST_NEWS
  }
}

// action that is dispatched whenever fetching the news finished
export const RECEIVE_NEWS = 'RECEIVE_NEWS';

export function receiveNews(news) {
  return {
    type: RECEIVE_NEWS,
    news: news,
    receivedAt: Date.now()
  }
}

// action that is dispatched whenever an error occurred while fetching the news data
export const ERROR_FETCHING_NEWS = 'ERROR_FETCHING_NEWS';

export function errorFetchingNews() {
  return {
    type: ERROR_FETCHING_NEWS,
    news: []
  }
}

export function fetchNews() { // a function as actions (enabled by thunk)
  return async function (dispatch) {
    dispatch(requestNews());
    try {
      const response = await fetch('https://www.dhbw-loerrach.de/index.php?id=3965&type=105');
      const responseBody = await response.text();
      const newsItems = fetchNewsData(responseBody);
      dispatch(receiveNews(newsItems));
    } catch(e) { // TODO: distinguish between network and other errors
      dispatch(errorFetchingNews());
    }
  }
}

// REDUCERS
function news(state = {
  isFetching: false,
  networkError: false,
  lastUpdated: null,
  news: []
}, action) {
  switch (action.type) {
    case REQUEST_NEWS:
      return {...state,
        isFetching: true,
        networkError: false
      };
    case RECEIVE_NEWS:
      return {...state,
        isFetching: false,
        news: action.news,
        networkError: false,
        lastUpdated: action.receivedAt
      };
    case ERROR_FETCHING_NEWS:
      return {...state,
        isFetching: false,
        networkError: true,
      };
    default:
      return state;
  }
}

// SETUP STORE with middleware

export default function setupStore(onComplete: ?() => void) {
  let store = createStore(reducers, applyMiddleware(thunk));
  // store = autoRehydrate()(store)(reducers);
  // persistStore(store, {storage: AsyncStorage}, onComplete);
  return store;
}

const reducers = combineReducers({
  news,
});
