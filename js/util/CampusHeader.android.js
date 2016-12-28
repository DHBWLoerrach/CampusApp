// @flow
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  ToolbarAndroid,
  View,
} from 'react-native';

import Colors from './Colors.js';

export default class CampusHeader extends Component {
  render() {
    let leftActionItem = this.props.leftActionItem;
    if (!leftActionItem) {
      leftActionItem = {
        icon: require('../img/menu.png'),
        onPress: () => alert('TODO: show drawer')
      };
    }

    let rightActionItem = this.props.rightActionItem;
    let rightActionItemSelected = null;
    if(rightActionItem) {
      rightActionItemSelected = rightActionItem.onPress;
      rightActionItem = [rightActionItem]; // ToolbarAndroid takes an array
    }

    return(
      <View style={styles.headerWrapper}>
        <ToolbarAndroid
          navIcon={leftActionItem && leftActionItem.icon}
          onIconClicked={leftActionItem && leftActionItem.onPress}
          actions={rightActionItem}
          onActionSelected={rightActionItemSelected}
          title={this.props.title}
          titleColor='white'
          style={styles.toolbar}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: Colors.dhbwRed,
    paddingTop: 25,
    elevation: 2,
  },
  toolbar: {
    height: 56,
  },
});
