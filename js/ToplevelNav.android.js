import React from 'react';
import { DrawerNavigator } from 'react-navigation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ImprintScreen from './tabs/service/ImprintScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

import Colors from './util/Colors';

const Drawer = DrawerNavigator(
  {
    News: {
      screen: NewsScreen,
      navigationOptions: {
        title: 'News',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="rss-feed" size={24} color={tintColor} />
        )
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="school" size={24} color={tintColor} />
        )
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="restaurant" size={24} color={tintColor} />
        )
      }
    },
    Imprint: {
      screen: ImprintScreen,
      navigationOptions: {
        title: 'Impressum',
        drawerIcon: ({ tintColor }) => (
          <MaterialCommunityIcon
            name="file-document"
            size={24}
            color={tintColor}
          />
        )
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="info-outline" size={24} color={tintColor} />
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

export default Drawer;
