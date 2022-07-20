import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Styles from '../../Styles/StyleSheet';
import NewsList from './NewsList';
import {
  DHBW_EVENTS,
  DHBW_NEWS,
} from '../../util/fetcher/FetchManager';

const Tab = createMaterialTopTabNavigator();

function News() {
  return <NewsList type={DHBW_NEWS} />;
}

function Events() {
  return <NewsList type={DHBW_EVENTS} />;
}

export default () => (
  <Tab.Navigator screenOptions={Styles.General.topTabBar}>
    <Tab.Screen name="DHBW-News" component={News} />
    <Tab.Screen name="DHBW-Termine" component={Events} />
  </Tab.Navigator>
);
