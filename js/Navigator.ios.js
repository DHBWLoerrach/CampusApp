import React, { Component } from 'react';
import { Text } from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import NewsScreen from './tabs/news/NewsScreen';
import NewsDetails from './tabs/news/NewsDetails';
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
          <Icon name="rss-feed" size={36} color={tintColor} />
        )
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        title: 'Vorlesungsplan',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="school" size={36} color={tintColor} />
        )
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="restaurant" size={36} color={tintColor} />
        )
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="info-outline" size={36} color={tintColor} />
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

const AppNavigator = StackNavigator(
  {
    Root: {
      screen: Tabs
    },
    NewsDetails: {
      screen: NewsDetails
    }
  },
  {
    navigationOptions: {
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: Colors.dhbwRed,
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        fontSize: 22
      }
    }
  }
);

export default class Navigator extends Component {
  render() {
    return <AppNavigator />;
  }
}
