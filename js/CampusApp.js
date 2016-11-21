// @flow
'use strict';

import React, { Component } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import TabsView from './TabsView';

export default class CampusApp extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          barStyle="light-content"
         />
        <TabsView/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
