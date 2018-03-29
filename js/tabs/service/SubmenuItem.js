import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '../../util/Colors';
import IconTouchable from '../../util/IconTouchable';

export default class SubmenuItem extends Component {
  render() {
    return (
      <IconTouchable onPress={this.props.onPress}>
        <View style={styles.container}>
          {this.props.icon}
          <Text style={styles.label}>{this.props.label}</Text>
        </View>
      </IconTouchable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 110,
    height: 70,
    marginBottom: 20
  },
  label: {
    color: Colors.lightText,
    textAlign: 'center'
  }
});
