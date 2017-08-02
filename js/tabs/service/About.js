 // @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';

import Colors from '../../util/Colors';

import { textAbout } from './Texts';

export default class About extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textAbout}</Text>
        <Text style={styles.link} onPress={() => Linking.openURL('mailto:apps@dhbw-loerrach.de')}>
          apps@dhbw-loerrach.de
        </Text>
        <Text style={styles.marginBig}>
          Diese App ist ein Open Source Projekt:
        </Text>
        <Text style={[styles.margin,styles.link]}
          onPress={() => Linking.openURL('https://github.com/DHBWLoerrach/CampusApp')}>
          github.com/DHBWLoerrach/CampusApp
        </Text>
        <Text style={styles.marginBig}>
          Version (App): 1.5.7
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  link: {
    fontSize: 15,
    color: Colors.link,
  },
  marginBig: {
    marginTop: 24,
  },
  margin: {
    marginTop: 12,
  }
});
