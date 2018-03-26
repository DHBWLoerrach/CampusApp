// @flow
import React, { Component } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

import {
  linksAccounts,
  linkBib,
  linksEmergency,
  linksFreetime,
  linksKBC,
  linksStudy
} from './Links';
import Submenu from './Submenu';
import { textPrivacy, textDisclaimer, textImprint } from './Texts';

export default class ServiceScreen extends Component {
  _getSubmenuItems() {
    const { navigate } = this.props.navigation;
    var submenuItems = [
      {
        label: 'Service-Zugänge',
        icon: require('./img/screen.png'),
        onPress: () => navigate('Accounts', { links: linksAccounts })
      },
      {
        label: 'Hilfe im Notfall',
        icon: require('./img/phone.png'),
        onPress: () => navigate('Emergency', { links: linksEmergency })
      },
      {
        label: 'Studium',
        icon: require('./img/school.png'),
        onPress: () => navigate('Study', { links: linksStudy })
      },
      {
        label: 'Bibliothek',
        icon: require('./img/study.png'),
        onPress: () => Linking.openURL(linkBib)
      },
      {
        label: 'Angebote bei der KBC',
        icon: require('./img/kbc.png'),
        onPress: () => navigate('KBC', { links: linksKBC })
      },
      {
        label: 'Freizeit',
        icon: require('./img/sun.png'),
        onPress: () => navigate('Freetime', { links: linksFreetime })
      },
      {
        label: 'Feedback',
        icon: require('./img/mail.png'),
        onPress: () => navigate('Feedback')
      },
      {
        label: 'Einstellungen',
        icon: require('./img/settings.png'),
        onPress: () => navigate('Settings')
      }
    ];

    if (Platform.OS === 'ios') {
      submenuItems.push(
        {
          label: 'Über',
          icon: require('./img/about.png'),
          onPress: () => navigate('About')
        },
        {
          label: 'Haftung',
          icon: require('./img/disclaimer.png'),
          onPress: () => navigate('Disclaimer', { text: textDisclaimer() })
        },
        {
          label: 'Impressum',
          icon: require('./img/imprint.png'),
          onPress: () => navigate('Imprint', { text: textImprint() })
        },
        {
          label: 'Datenschutz',
          icon: require('./img/privacy.png'),
          onPress: () => navigate('Privacy', { text: textPrivacy() })
        }
      );
    }
    return submenuItems;
  }

  render() {
    return (
      <View style={styles.screenContainer}>
        <ScrollView>
          <Submenu menuItems={this._getSubmenuItems()} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white'
  }
});
