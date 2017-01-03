// @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import RoleSelection from './RoleSelection';
import { textSettings } from './Texts';

export default class Settings extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textSettings}</Text>
        <RoleSelection/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  optionContainer: {
    flexDirection: 'row',
  },
});
