// @flow
'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Colors from '../../util/Colors';

export default class SubmenuItem extends Component {
  render() {
    return(
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          <Image source={this.props.icon} />
          <Text style={styles.label}>
            {this.props.label}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 110,
    height: 70,
    marginBottom: 20,
  },
  label: {
    color: Colors.lightText,
    marginTop: 5
  }
});
