import React, { Component } from 'react';
import { Platform, StatusBar } from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';
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

const iconSize = Platform.OS === 'ios' ? 32 : 24;

const Tabs = TabNavigator(
  {
    News: {
      screen: NewsScreen,
      navigationOptions: {
        title: 'News',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon
            name="rss-feed"
            size={iconSize}
            color={tintColor}
          />
        )
      }
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        title: 'Vorlesungsplan',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon name="school" size={iconSize} color={tintColor} />
        )
      }
    },
    Canteen: {
      screen: CanteenScreen,
      navigationOptions: {
        title: 'Mensa',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon
            name="restaurant"
            size={iconSize}
            color={tintColor}
          />
        )
      }
    },
    Service: {
      screen: ServiceScreen,
      navigationOptions: {
        title: 'Service',
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcon
            name="info-outline"
            size={iconSize}
            color={tintColor}
          />
        )
      }
    }
  },
  {
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: Colors.dhbwRed,
      inactiveTintColor: '#929292',
      style: {
        backgroundColor: '#f4f4f4' // for bottom tab bar
      },
      indicatorStyle: {
        height: 0 // prevent indicator line in Android
      },
      showIcon: true,
      upperCaseLabel: false,
      ...Platform.select({
        // Android: labels with smaller font and wider
        android: {
          labelStyle: {
            margin: 0,
            width: 100
          }
        }
      }),
      pressColor: Colors.lightGray
    },
    swipeEnabled: false
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
    }
  }
);

export default class Navigator extends Component {
  render() {
    return <AppNavigator />;
  }
}
