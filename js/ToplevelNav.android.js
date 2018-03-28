import React from 'react';
import { DrawerNavigator } from 'react-navigation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import HeaderIcon from './util/HeaderIcon';

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
      navigationOptions: ({ navigation }) => ({
        title: 'News',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="rss-feed" size={24} color={tintColor} />
        ),
        headerLeft: (
          <HeaderIcon
            onPress={() => navigation.navigate('DrawerToggle')}
            icon="menu"
            size={36}
          />
        )
      })
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Vorlesungsplan',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="school" size={24} color={tintColor} />
        ),
        headerLeft: (
          <HeaderIcon
            onPress={() => navigation.navigate('DrawerToggle')}
            icon="menu"
            size={36}
          />
        )
      })
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Mensa',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="restaurant" size={24} color={tintColor} />
        ),
        headerLeft: (
          <HeaderIcon
            onPress={() => navigation.navigate('DrawerToggle')}
            icon="menu"
            size={36}
          />
        )
      })
    },
    Imprint: {
      screen: ImprintScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Impressum',
        drawerIcon: ({ tintColor }) => (
          <MaterialCommunityIcon
            name="file-document"
            size={24}
            color={tintColor}
          />
        ),
        headerLeft: (
          <HeaderIcon
            onPress={() => navigation.navigate('DrawerToggle')}
            icon="menu"
            size={36}
          />
        )
      })
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Service',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcon name="info-outline" size={24} color={tintColor} />
        ),
        headerLeft: (
          <HeaderIcon
            onPress={() => navigation.navigate('DrawerToggle')}
            icon="menu"
            size={36}
          />
        )
      })
    }
  },
  {
    contentOptions: {
      activeTintColor: Colors.dhbwRed
    }
  }
);

export default Drawer;
