import React, { Component } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {
  linksAccounts,
  linkBib,
  linksEmergency,
  linksFreetime,
  linksKBC,
  linkOrientation,
  linksStudy,
} from './Links';
import Submenu from './Submenu';
import {
  TextPrivacy,
  TextAgreedDisclaimer,
  TextImprint,
} from './Texts';
import Color from '../../util/Colors';

const iconSize = 36;

export default class ServiceScreen extends Component {
  _getSubmenuItems() {
    const { navigate } = this.props.navigation;
    var submenuItems = [
      {
        label: 'Anreise',
        icon: (
          <FontAwesome
            name="map-marker"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => Linking.openURL(linkOrientation),
      },
      {
        label: 'Gebäude Hangstraße',
        icon: (
          <MaterialIcon
            name="map"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('CampusHangstr'),
      },
      {
        label: 'Service-Zugänge',
        icon: (
          <MaterialIcon
            name="screen-share"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Accounts', { links: linksAccounts }),
      },
      {
        label: 'Hilfe im Notfall',
        icon: (
          <MaterialIcon
            name="phone"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () =>
          navigate('Emergency', { links: linksEmergency }),
      },
      {
        label: 'Studium',
        icon: (
          <MaterialIcon
            name="school"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Study', { links: linksStudy }),
      },
      {
        label: 'Katalog Bibliothek',
        icon: (
          <MaterialCommunityIcon
            name="book-open-variant"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => Linking.openURL(linkBib),
      },
      {
        label: 'Angebote bei der KBC',
        icon: <Image source={require('./img/kbc.png')} />,
        onPress: () => navigate('KBC', { links: linksKBC }),
      },
      {
        label: 'Freizeit',
        icon: (
          <MaterialIcon
            name="wb-sunny"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Freetime', { links: linksFreetime }),
      },
      {
        label: 'Feedback',
        icon: (
          <MaterialIcon
            name="mail-outline"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Feedback'),
      },
      {
        label: 'Einstellungen',
        icon: (
          <MaterialIcon
            name="settings"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Settings'),
      },
      {
        label: 'Über',
        icon: (
          <MaterialIcon
            name="help-outline"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('About'),
      },
      {
        label: 'Haftung',
        icon: <Image source={require('./img/disclaimer.png')} />,
        onPress: () =>
          navigate('Disclaimer', { text: <TextAgreedDisclaimer /> }),
      },
      {
        label: 'Impressum',
        icon: (
          <MaterialCommunityIcon
            name="file-document"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Imprint', { text: <TextImprint /> }),
      },
      {
        label: 'Datenschutz',
        icon: (
          <MaterialIcon
            name="remove-red-eye"
            size={iconSize}
            color={Color.icon}
          />
        ),
        onPress: () => navigate('Privacy', { text: <TextPrivacy /> }),
      },
    ];
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
    backgroundColor: 'white',
  },
});
