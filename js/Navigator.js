import React, { Component } from 'react';
import { Platform } from 'react-native';
import { TabNavigator } from 'react-navigation';

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
        title: 'Tagebuch'
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        title: 'Vorlesungsplan'
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa'
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service'
      }
    }
  },
  {
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: Colors.dhbwRed,
      inactiveTintColor: '#929292',
      style: {
        backgroundColor: '#f4f4f4' // tab bar background
      },
      indicatorStyle: {
        height: 0 // make bottom indicator invisible
      },
      showIcon: true,
      upperCaseLabel: false,
      labelStyle: {
        // Android only: no margin to bottom
        ...Platform.select({ android: { marginBottom: 0 } })
      }
    },
    swipeEnabled: false
  }
);

export default class Navigator extends Component {
  render() {
    return <Tabs />;
  }
}
