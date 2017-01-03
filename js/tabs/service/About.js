 // @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import { textAbout } from './Texts';

export default class About extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textAbout}</Text>
        <Text style={styles.email} onPress={() => Linking.openURL('mailto:apps@dhbw-loerrach.de')}>
          apps@dhbw-loerrach.de
        </Text>
        <Text style={styles.version}>
          Version (App): 1.??
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  email: {
    fontSize: 15,
    color: '#002350',
  },
  version: {
    marginTop: 12,
  }
});
