import React, { Component } from 'react';
import { Text, View } from 'react-native';

import IconTouchable from '../../util/IconTouchable';
import Styles from '../../Styles/StyleSheet';

export default class SubmenuItem extends Component {
  render() {
    return (
      <IconTouchable onPress={this.props.onPress}>
        <View style={Styles.SubmenuItem.container}>
          {this.props.icon}
          <Text style={Styles.SubmenuItem.label}>{this.props.label}</Text>
        </View>
      </IconTouchable>
    );
  }
}
