import React, { Component } from 'react';
import { StackNavigator, TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Colors from './util/Colors';

import NewsDetails from './tabs/news/NewsDetails';
import EditCourse from './tabs/schedule/EditCourse';
import InfoText from './tabs/service/InfoText';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';

import ToplevelNav from './ToplevelNav';

const AppNavigator = StackNavigator(
  {
    Root: {
      screen: ToplevelNav
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
