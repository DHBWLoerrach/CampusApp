import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Colors from '../../util/Colors';
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
  <Tab.Navigator
    tabBarOptions={{
      indicatorStyle: { backgroundColor: 'white' },
      labelStyle: { color: 'white' },
      style: { backgroundColor: Colors.dhbwRed },
    }}
  >
    <Tab.Screen name="DHBW-News" component={News} />
    <Tab.Screen name="DHBW-Termine" component={Events} />
  </Tab.Navigator>
);
