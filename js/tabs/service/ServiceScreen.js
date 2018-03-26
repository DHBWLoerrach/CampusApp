// @flow
import React, { Component } from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const iconSize = 36;

export default class ServiceScreen extends Component {
  _getSubmenuItems() {
    const { navigate } = this.props.navigation;
    var submenuItems = [
      {
        label: 'Service-Zugänge',
        icon: <MaterialIcon name="screen-share" size={iconSize} />,
        onPress: () => navigate('Accounts', { links: linksAccounts })
      },
      {
        label: 'Hilfe im Notfall',
        icon: <MaterialIcon name="phone" size={iconSize} />,
        onPress: () => navigate('Emergency', { links: linksEmergency })
      },
      {
        label: 'Studium',
        icon: <MaterialIcon name="school" size={iconSize} />,
        onPress: () => navigate('Study', { links: linksStudy })
      },
      {
        label: 'Bibliothek',
        icon: (
          <MaterialCommunityIcons
            name="book-open-variant"
            size={iconSize}
          />
        ),
        onPress: () => Linking.openURL(linkBib)
      },
      {
        label: 'Angebote bei der KBC',
        icon: <Image source={require('./img/kbc.png')} />,
        onPress: () => navigate('KBC', { links: linksKBC })
      },
      {
        label: 'Freizeit',
        icon: <MaterialIcon name="wb-sunny" size={iconSize} />,
        onPress: () => navigate('Freetime', { links: linksFreetime })
      },
      {
        label: 'Feedback',
        icon: <MaterialIcon name="mail-outline" size={iconSize} />,
        onPress: () => navigate('Feedback')
      },
      {
        label: 'Einstellungen',
        icon: <MaterialIcon name="settings" size={iconSize} />,
        onPress: () => navigate('Settings')
      }
    ];

    if (Platform.OS === 'ios') {
      submenuItems.push(
        {
          label: 'Über',
          icon: <MaterialIcon name="help-outline" size={iconSize} />,
          onPress: () => navigate('About')
        },
        {
          label: 'Haftung',
          icon: <Image source={require('./img/disclaimer.png')} />,
          onPress: () => navigate('Disclaimer', { text: textDisclaimer() })
        },
        {
          label: 'Impressum',
          icon: (
            <MaterialCommunityIcons name="file-document" size={iconSize} />
          ),
          onPress: () => navigate('Imprint', { text: textImprint() })
        },
        {
          label: 'Datenschutz',
          icon: <MaterialIcon name="remove-red-eye" size={iconSize} />,
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
