import React, { Component } from 'react';
import { Text, View } from 'react-native';

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
