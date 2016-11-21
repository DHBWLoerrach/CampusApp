// @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from './Colors.js';

export default class CampusHeader extends Component {
  render() {
    return(
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>
            {this.props.title}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.dhbwRed,
    paddingTop: 20,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 2,
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: -1,
  },
});
