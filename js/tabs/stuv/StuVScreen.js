import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Colors from '../../util/Colors';
import StuVEvents from './events/StuVEvents';
import StuVNews from './news/StuVNews';

const Tab = createMaterialTopTabNavigator();

export default () => (
  <Tab.Navigator
    tabBarOptions={{
      indicatorStyle: { backgroundColor: 'white' },
      labelStyle: { color: 'white' },
      style: { backgroundColor: Colors.dhbwRed },
    }}
  >
    <Tab.Screen name="StuV-News" component={StuVNews} />
    <Tab.Screen name="StuV-Events" component={StuVEvents} />
  </Tab.Navigator>
);
