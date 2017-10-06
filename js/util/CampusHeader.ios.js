// @flow
import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from './Colors.js';

export default class CampusHeader extends Component {
  _renderActionItem(actionItem) {
    if (actionItem) {
      return (
        <TouchableOpacity
          onPress={actionItem.onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image style={styles.actionImage} source={actionItem.icon} />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <View style={styles.header}>
        <View style={styles.leftItem}>
          {this._renderActionItem(this.props.leftActionItem)}
        </View>
        <View style={styles.centerItem}>
          <Text style={styles.titleText} ellipsizeMode="tail" numberOfLines={1}>
            {this.props.title}
          </Text>
        </View>
        <View style={styles.rightItem}>
          {this._renderActionItem(this.props.rightActionItem)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.dhbwRed,
    paddingTop: 20,
    height: 60
  },
  leftItem: {
    width: 40,
    justifyContent: 'center',
    paddingLeft: 3
  },
  centerItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3
  },
  rightItem: {
    width: 25,
    justifyContent: 'center',
    paddingRight: 3
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: -1
  },
  actionImage: {
    width: 22,
    height: 22
  }
});
