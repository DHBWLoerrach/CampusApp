// @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';

export default class DayHeader extends Component {
  props: {
    title: string;
  };

  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.label}>
          {this.props.title}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.lightGray,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Constants.listViewRowPaddingHorizontal,
  },
  label: {
    color: Colors.lightText,
  },
});
