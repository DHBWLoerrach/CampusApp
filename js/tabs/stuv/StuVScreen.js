import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Styles from '../../Styles/StyleSheet';
import StuVEvents from './events/StuVEvents';
import StuVNews from './news/StuVNews';

// const Tab = createMaterialTopTabNavigator();

// export default () => (
//   <Tab.Navigator screenOptions={Styles.topTabBar}>
//     <Tab.Screen name="StuV-News" component={StuVNews} />
//     <Tab.Screen name="StuV-Events" component={StuVEvents} />
//   </Tab.Navigator>
// );

export default () => <StuVEvents />;