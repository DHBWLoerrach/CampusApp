import React from 'react';
import { TabNavigator } from 'react-navigation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

import Colors from './util/Colors';

const Tabs = TabNavigator(
  {
    News: {
      screen: NewsScreen,
      navigationOptions: {
        title: 'News',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon name="rss-feed" size={36} color={tintColor} />
        )
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        title: 'Vorlesungsplan',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon name="school" size={36} color={tintColor} />
        )
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon name="restaurant" size={36} color={tintColor} />
        )
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon name="info-outline" size={36} color={tintColor} />
        )
      }
    }
  },
  {
    tabBarOptions: {
      activeTintColor: Colors.dhbwRed
    }
  }
);

export default Tabs;
