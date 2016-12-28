// @flow
'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from './Colors.js';

export default class CampusHeader extends Component {
  _renderActionItem(actionItem) {
      if(actionItem) {
        return(
          <TouchableOpacity onPress={actionItem.onPress}>
            <Image style={styles.actionImage} source={actionItem.icon}/>
          </TouchableOpacity>
        );
      } else {
        return null;
      }
  }

  render() {
    return(
      <View style={styles.header}>
        <View style={styles.leftActionItem}>
          {this._renderActionItem(this.props.leftActionItem)}
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>
            {this.props.title}
          </Text>
        </View>
        <View style={styles.rightActionItem}>
          {this._renderActionItem(this.props.rightActionItem)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.dhbwRed,
    paddingTop: 20,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  leftActionItem: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: -1,
  },
  rightActionItem: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 5,
    paddingRight: 25,
  },
  actionImage: {
    width: 22,
    height: 22,
  },
});
