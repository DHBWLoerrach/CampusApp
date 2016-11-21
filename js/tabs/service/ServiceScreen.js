// @flow
'use strict';

import React, { Component } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';

import Submenu from './Submenu';

export default class ServiceScreen extends Component {
  _getSubmenuItems() {
    var submenuItems = [
      {label: "Service-Zugänge", icon: require('./img/screen.png'),
      },
      {label: "Hilfe im Notfall", icon: require('./img/phone.png'),
      },
      {label: "Studium", icon: require('./img/school.png'),
      },
      {label: "Bibliothek",icon: require('./img/study.png'),
      },
      {label: "Freizeit", icon: require('./img/sun.png'),
      },
      {label: "Feedback", icon: require('./img/mail.png'),
      },
      {label: "Einstellungen",icon: require('./img/settings.png'),
      },
    ];

    if(Platform.OS === "ios"){
      submenuItems.push(
        {label: "Über", icon: require('./img/about.png'),
        },
        {label: "Haftung", icon: require('./img/disclaimer.png'),
        },
        {label: "Impressum", icon: require('./img/imprint.png'),
        },
        {label: "Datenschutz", icon: require('./img/privacy.png'),
        },
      );
    }
    return submenuItems;
  }

  render() {
    return(
      <View>
        <CampusHeader title="Service"/>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Submenu menuItems={this._getSubmenuItems()}/>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: 'white',
    marginTop: 20,
  }
});
