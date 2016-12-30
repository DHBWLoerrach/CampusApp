// @flow
'use strict';

import { AsyncStorage } from 'react-native';
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
} from 'redux';
import thunk from 'redux-thunk'; // thunk middleware to use functions as actions
import {
  persistStore,
  autoRehydrate,
} from 'redux-persist';
import { news } from './tabs/news/redux';

// SETUP STORE with middleware

export default function setupStore() {
  // enhance store: autohydrate (offline data), thunk middleware (functions actions)
  const storeEnhancers = compose(autoRehydrate(), applyMiddleware(thunk));
  const store = createStore(combineReducers({news}), {}, storeEnhancers);
  persistStore(store, {storage: AsyncStorage});
  return store;
}
