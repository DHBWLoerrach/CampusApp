import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from './Colors';
import Constants from './Constants';
import Styles from '../Styles/StyleSheet';

export default class DayHeader extends Component {
  render() {
    return (
      <View style={Styles.DayHeader.header}>
        <Text style={Styles.DayHeader.label}>{this.props.title}</Text>
      </View>
    );
  }
}