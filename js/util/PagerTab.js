// @flow
'use strict';

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default class PagerTab extends Component {
  props: {
    title: string;
    isSelected: boolean;
    onPress: () => void;
  };

  render() {
    let selectedTabStyle;
    if (this.props.isSelected) selectedTabStyle = { borderColor: 'white' };
    const title = this.props.title && this.props.title.toUpperCase();

    return (
      <TouchableOpacity activeOpacity={0.8}
        onPress={this.props.onPress}
        style={[styles.pageTab, selectedTabStyle]}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    );
  }
}

const HEIGHT = 28;

const styles = StyleSheet.create({
  pageTab: {
    borderColor: 'transparent',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        height: HEIGHT,
        paddingHorizontal: 2,
        borderRadius: HEIGHT / 2,
        borderWidth: 1,
      },
      android: {
        paddingBottom: 6,
        paddingHorizontal: 2,
        borderBottomWidth: 3,
        marginRight: 8,
      },
    }),
  },
  title: {
    letterSpacing: 1,
    fontSize: Platform.OS === 'android' ? 12 : 11,
    color: 'white',
  },
});
