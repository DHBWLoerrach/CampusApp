import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Styles from '../../util/Styles';
import StuVEvents from './events/StuVEvents';
import StuVNews from './news/StuVNews';

const Tab = createMaterialTopTabNavigator();

export default () => (
  <Tab.Navigator tabBarOptions={Styles.topTabBar}>
    <Tab.Screen name="StuV-News" component={StuVNews} />
    <Tab.Screen name="StuV-Events" component={StuVEvents} />
  </Tab.Navigator>
);
