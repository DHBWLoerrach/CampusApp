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
            <Image source={actionItem.icon}/>
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
    height: 100,
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
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: -1,
  },
  rightActionItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
