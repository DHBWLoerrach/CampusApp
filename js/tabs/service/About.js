import React, { Component } from 'react';
import { StyleSheet, Text, ScrollView, Linking } from 'react-native';

import Colors from '../../util/Colors';

import { textAbout } from './Texts';
import Styles from '../../Styles/StyleSheet';

export default class About extends Component {
  render() {
    return (
      <ScrollView style={Styles.About.container}>
        <Text>{textAbout}</Text>
        <Text
          style={Styles.About.link}
          onPress={() =>
            Linking.openURL('mailto:apps@dhbw-loerrach.de')
          }
        >
          apps@dhbw-loerrach.de
        </Text>
        <Text style={Styles.About.marginBig}>
          Diese App ist ein Open Source Projekt:
        </Text>
        <Text
          style={[Styles.About.margin, Styles.About.link]}
          onPress={() =>
            Linking.openURL(
              'https://github.com/DHBWLoerrach/CampusApp'
            )
          }
        >
          github.com/DHBWLoerrach/CampusApp
        </Text>
        <Text style={Styles.About.marginBig}>Version (App): 2.5.10</Text>
      </ScrollView>
    );
  }
}