import React, { Component } from 'react';
import {
  Linking,
  ScrollView,
  View,
  StyleSheet
} from 'react-native';

import {
  linksAccounts,
  linkBib,
  linksEmergency,
  linksFreetime,
  linksKBC,
  linkOrientation,
  linksStudy,
} from './Links';
import SubmenuDark from './menu/SubmenuDark';
import {
  TextPrivacy,
  TextAgreedDisclaimer,
  TextImprint,
} from './Texts';
import Color from "../../Styles/Colors";

export default class ServiceScreenDark extends Component {

  _getSubmenuItems() {
    const { navigate } = this.props.navigation;
    return [
      {
        label: 'Anreise',
        iconName: "location-dot",
        onPress: () => Linking.openURL(linkOrientation),
      },
      {
        label: 'Gebäude Hangstraße',
        iconName: "map",
        onPress: () => navigate('CampusHangstr'),
      },
      {
        label: 'Service-Zugänge',
        iconName: "link",
        onPress: () => navigate('Accounts', { links: linksAccounts }),
      },
      {
        label: 'Hilfe im Notfall',
        iconName: "phone",
        onPress: () =>
          navigate('Emergency', { links: linksEmergency }),
      },
      {
        label: 'Studium',
        iconName: "graduation-cap",
        onPress: () => navigate('Study', { links: linksStudy }),
      },
      {
        label: 'Katalog Bibliothek',
        iconName: "book-open",
        onPress: () => Linking.openURL(linkBib),
      },
      {
        label: 'Angebote bei der KBC',
        iconName: 'school',
        onPress: () => navigate('KBC', { links: linksKBC }),
      },
      {
        label: 'Freizeit',
        iconName: "cloud-sun",
        onPress: () => navigate('Freetime', { links: linksFreetime }),
      },
      {
        label: 'Feedback',
        iconName: "envelope",
        onPress: () => navigate('Feedback'),
      },
      {
        label: 'Einstellungen',
        iconName: "gear",
        onPress: () => navigate('Settings'),
      },
      {
        label: 'Über',
        iconName: "circle-info",
        onPress: () => navigate('About'),
      },
      {
        label: 'Haftung',
        iconName: 'file-shield',
        onPress: () =>
          navigate('Disclaimer', { text: <TextAgreedDisclaimer /> }),
      },
      {
        label: 'Impressum',
        iconName: "file-lines",
        onPress: () => navigate('Imprint', { text: <TextImprint /> }),
      },
      {
        label: 'Datenschutz',
        iconName: 'eye',
        onPress: () => navigate('Privacy', { text: <TextPrivacy /> }),
      },
    ];
  }

  render() {
    return (
      <View style={styles.screenContainer}>
        <ScrollView>
          <SubmenuDark menuItems={this._getSubmenuItems()} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Color.darkMode.background
  }
});
