import React, { Component } from 'react';
import { Platform, StatusBar } from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator
} from 'react-navigation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Colors from './util/Colors';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';
import NewsDetails from './tabs/news/NewsDetails';
import EditCourse from './tabs/schedule/EditCourse';
import InfoText from './tabs/service/InfoText';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';

const stackHeaderConfig = {
  headerBackTitle: null,
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: Colors.dhbwRed,
    borderBottomWidth: 0,
    ...Platform.select({
      android: {
        elevation: 0,
        paddingTop: StatusBar.currentHeight
      }
    })
  }
};

const NewsStack = createStackNavigator(
  {
    Home: {
      screen: NewsScreen,
      navigationOptions: { title: 'Neuigkeiten & Termine' }
    },
    NewsDetails: NewsDetails
  },
  {
    navigationOptions: stackHeaderConfig
  }
);

const ScheduleStack = createStackNavigator(
  {
    Home: {
      screen: ScheduleScreen,
      navigationOptions: { title: 'Vorlesungsplan' }
    },
    EditCourse: {
      screen: EditCourse,
      navigationOptions: { title: 'Kurs eingeben' }
    }
  },
  {
    navigationOptions: stackHeaderConfig
  }
);

const CanteenStack = createStackNavigator(
  {
    Home: {
      screen: CanteenScreen,
      navigationOptions: { title: 'Speiseplan' }
    }
  },
  {
    navigationOptions: stackHeaderConfig
  }
);

const ServiceStack = createStackNavigator(
  {
    Home: {
      screen: ServiceScreen,
      navigationOptions: { title: 'Service-Links & weitere Infos' }
    },
    Accounts: {
      screen: LinksList,
      navigationOptions: { title: 'Service-Zugänge' }
    },
    Emergency: {
      screen: LinksList,
      navigationOptions: { title: 'Hilfe im Notfall' }
    },
    Study: {
      screen: LinksList,
      navigationOptions: { title: 'Studium' }
    },
    KBC: {
      screen: LinksList,
      navigationOptions: { title: 'Angebote KBC' }
    },
    Freetime: {
      screen: LinksList,
      navigationOptions: { title: 'Freizeit' }
    },
    Feedback: {
      screen: Feedback,
      navigationOptions: { title: 'Feedback' }
    },
    Settings: {
      screen: Settings,
      navigationOptions: { title: 'Einstellungen' }
    },
    About: {
      screen: About,
      navigationOptions: { title: 'Über' }
    },
    Disclaimer: {
      screen: InfoText,
      navigationOptions: { title: 'Haftung' }
    },
    Imprint: {
      screen: InfoText,
      navigationOptions: { title: 'Impressum' }
    },
    Privacy: {
      screen: InfoText,
      navigationOptions: { title: 'Datenschutz' }
    },
    CafeteriaKKH: {
      screen: InfoText,
      navigationOptions: { title: 'Cafeteria im KKH' }
    },
    Hieber: {
      screen: InfoText,
      navigationOptions: { title: "Hieber's Frische Center" }
    }
  },
  {
    navigationOptions: stackHeaderConfig
  }
);

const AppNavigator = createBottomTabNavigator(
  {
    News: NewsStack,
    Schedule: {
      screen: ScheduleStack,
      navigationOptions: {
        title: 'Vorlesungsplan'
      }
    },
    Canteen: {
      screen: CanteenStack,
      navigationOptions: {
        title: 'Mensa'
      }
    },
    Service: ServiceStack
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'News') iconName = 'rss-feed';
        else if (routeName === 'Schedule') iconName = 'school';
        else if (routeName === 'Canteen') iconName = 'restaurant';
        else if (routeName === 'Service') iconName = 'info-outline';

        return (
          <MaterialIcon name={iconName} size={32} color={tintColor} />
        );
      }
    }),
    tabBarOptions: {
      activeTintColor: Colors.dhbwRed
    }
  }
);

export default class Navigator extends Component {
  render() {
    return <AppNavigator />;
  }
}
