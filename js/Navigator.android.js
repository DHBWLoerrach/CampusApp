import React, { Component } from 'react';
import { StackNavigator, DrawerNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

import Colors from './util/Colors';

const Drawer = DrawerNavigator(
  {
    News: {
      screen: NewsScreen,
      navigationOptions: {
        title: 'News',
        drawerIcon: ({ tintColor }) => (
          <Icon name="rss-feed" size={24} color={tintColor} />
        )
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        title: 'Vorlesungsplan',
        drawerIcon: ({ tintColor }) => (
          <Icon name="school" size={24} color={tintColor} />
        )
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa',
        drawerIcon: ({ tintColor }) => (
          <Icon name="restaurant" size={24} color={tintColor} />
        )
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service',
        drawerIcon: ({ tintColor }) => (
          <Icon name="info-outline" size={24} color={tintColor} />
        )
      }
    }
  },
  {
    contentOptions: {
      activeTintColor: Colors.dhbwRed
    }
  }
);

const AppNavigator = StackNavigator(
  {
    Root: {
      screen: Drawer
    }
  },
  {
    navigationOptions: {
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: Colors.dhbwRed,
        borderBottomWidth: 0
      }
    }
  }
);

export default class Navigator extends Component {
  render() {
    return <AppNavigator />;
  }
}
