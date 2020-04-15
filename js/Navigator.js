import React, { Component } from 'react';
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Colors from './util/Colors';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';
import NewsDetails from './tabs/news/NewsDetails';
import EditCourse from './tabs/schedule/EditCourse';
import InfoText from './tabs/service/InfoText';
import InfoImage from './tabs/service/InfoImage';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';

const stackHeaderConfig = {
  headerBackTitle: 'Zurück',
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: Colors.dhbwRed,
    borderBottomWidth: 0,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
};

const NewsStack = createStackNavigator(
  {
    Home: {
      screen: NewsScreen,
      navigationOptions: {
        title: 'Neuigkeiten & Termine',
      },
    },
    NewsDetails: NewsDetails,
  },
  {
    defaultNavigationOptions: stackHeaderConfig,
  }
);

const ScheduleStack = createStackNavigator(
  {
    Home: {
      screen: ScheduleScreen,
      navigationOptions: { title: 'Vorlesungsplan' },
    },
    EditCourse: {
      screen: EditCourse,
      navigationOptions: { title: 'Kurs eingeben' },
    },
  },
  {
    defaultNavigationOptions: stackHeaderConfig,
  }
);

const CanteenStack = createStackNavigator(
  {
    Home: {
      screen: CanteenScreen,
      navigationOptions: { title: 'Speiseplan' },
    },
  },
  {
    defaultNavigationOptions: stackHeaderConfig,
  }
);

const ServiceStack = createStackNavigator(
  {
    Home: {
      screen: ServiceScreen,
      navigationOptions: { title: 'Services der DHBW Lörrach' },
    },
    Accounts: {
      screen: LinksList,
      navigationOptions: { title: 'Service-Zugänge' },
    },
    Emergency: {
      screen: LinksList,
      navigationOptions: { title: 'Hilfe im Notfall' },
    },
    Study: {
      screen: LinksList,
      navigationOptions: { title: 'Studium' },
    },
    KBC: {
      screen: LinksList,
      navigationOptions: { title: 'Angebote KBC' },
    },
    Freetime: {
      screen: LinksList,
      navigationOptions: { title: 'Freizeit' },
    },
    Feedback: {
      screen: Feedback,
      navigationOptions: { title: 'Feedback' },
    },
    Settings: {
      screen: Settings,
      navigationOptions: { title: 'Einstellungen' },
    },
    About: {
      screen: About,
      navigationOptions: { title: 'Über' },
    },
    Disclaimer: {
      screen: InfoText,
      navigationOptions: { title: 'Haftung' },
    },
    Imprint: {
      screen: InfoText,
      navigationOptions: { title: 'Impressum' },
    },
    Privacy: {
      screen: InfoText,
      navigationOptions: { title: 'Datenschutz' },
    },
    CafeteriaKKH: {
      screen: InfoText,
      navigationOptions: { title: 'Cafeteria im KKH' },
    },
    Hieber: {
      screen: InfoText,
      navigationOptions: { title: "Hieber's Frische Center" },
    },
    CampusHangstr: {
      screen: InfoImage,
      navigationOptions: { title: 'Campus Hangstraße' },
    },
  },
  {
    defaultNavigationOptions: stackHeaderConfig,
  }
);

const Tabs = createBottomTabNavigator(
  {
    News: NewsStack,
    Schedule: {
      screen: ScheduleStack,
      navigationOptions: {
        title: 'Vorlesungsplan',
      },
    },
    Canteen: {
      screen: CanteenStack,
      navigationOptions: {
        title: 'Mensa',
      },
    },
    Services: ServiceStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'News') iconName = 'rss-feed';
        else if (routeName === 'Schedule') iconName = 'school';
        else if (routeName === 'Canteen') iconName = 'restaurant';
        else if (routeName === 'Services') iconName = 'info-outline';

        return (
          <MaterialIcon name={iconName} size={32} color={tintColor} />
        );
      },
    }),
    tabBarOptions: {
      activeTintColor: Colors.dhbwRed,
    },
  }
);

const AppNavigator = createAppContainer(Tabs);

export default class Navigator extends Component {
  render() {
    return <AppNavigator />;
  }
}
