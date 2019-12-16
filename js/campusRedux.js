import AsyncStorage from '@react-native-community/async-storage';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk'; // thunk middleware to use functions as actions
import { persistStore, persistCombineReducers } from 'redux-persist';
import { news } from './tabs/news/redux';
import { schedule } from './tabs/schedule/redux';

export default function setupStore(onComplete) {
  const config = {
    key: 'primary',
    storage: AsyncStorage
  };

  const reducers = persistCombineReducers(config, {
    news,
    schedule
  });

  const store = createStore(
    reducers,
    undefined,
    compose(applyMiddleware(thunk))
  );

  persistStore(store, null, onComplete);
  return store;
}
