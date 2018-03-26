import React, { Component } from 'react';
import { Text } from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import NewsScreen from './tabs/news/NewsScreen';
import NewsDetails from './tabs/news/NewsDetails';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import EditCourse from './tabs/schedule/EditCourse';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

import Colors from './util/Colors';

import InfoText from './tabs/service/InfoText';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';

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
    },
    EditCourse: {
      screen: EditCourse,
      navigationOptions: {
        title: 'Kurs eingeben',
        headerBackTitle: 'Abbrechen'
      }
    },
    Accounts: {
      screen: LinksList,
      navigationOptions: {
        title: 'Service-Zugänge'
      }
    },
    Emergency: {
      screen: LinksList,
      navigationOptions: {
        title: 'Hilfe im Notfall'
      }
    },
    Study: {
      screen: LinksList,
      navigationOptions: {
        title: 'Studium'
      }
    },
    KBC: {
      screen: LinksList,
      navigationOptions: {
        title: 'Angebote KBC'
      }
    },
    Freetime: {
      screen: LinksList,
      navigationOptions: {
        title: 'Freizeit'
      }
    },
    Feedback: {
      screen: Feedback,
      navigationOptions: {
        title: 'Feedback'
      }
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        title: 'Einstellungen'
      }
    },
    About: {
      screen: About,
      navigationOptions: {
        title: 'Über'
      }
    },
    Disclaimer: {
      screen: InfoText,
      navigationOptions: {
        title: 'Haftung'
      }
    },
    Imprint: {
      screen: InfoText,
      navigationOptions: {
        title: 'Impressum'
      }
    },
    Privacy: {
      screen: InfoText,
      navigationOptions: {
        title: 'Datenschutz'
      }
    },
    CafeteriaKKH: {
      screen: InfoText,
      navigationOptions: {
        title: 'Cafeteria im KKH'
      }
    },
    Hieber: {
      screen: InfoText,
      navigationOptions: {
        title: "Hieber's Frische Center"
      }
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
