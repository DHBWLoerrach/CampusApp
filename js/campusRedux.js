// @flow
import { AsyncStorage } from 'react-native';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk'; // thunk middleware to use functions as actions
import { persistStore, autoRehydrate } from 'redux-persist';
import { news } from './tabs/news/redux';
import { schedule } from './tabs/schedule/redux';
import { canteen } from './tabs/canteen/redux';
import { settings } from './tabs/service/redux';

// SETUP STORE with middleware

export default function setupStore(onComplete: ?() => void) {
  const reducers = combineReducers({ news, schedule, canteen, settings });
  // enhance store: autohydrate (offline data), thunk middleware (functions actions)
  const storeEnhancers = compose(autoRehydrate(), applyMiddleware(thunk));
  const store = createStore(reducers, {}, storeEnhancers);
  persistStore(store, { storage: AsyncStorage }, onComplete);
  return store;
}
