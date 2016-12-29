// @flow
'use strict';

import React, { Component } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Provider } from 'react-redux';

import setupStore from './campusRedux';

import TabsView from './TabsView';

export default class CampusApp extends Component {
  constructor() {
    super();
    this.state = {
      store: setupStore(),
    };
  }

  render() {
    return (
      <Provider store={this.state.store}>
        <View style={styles.container}>
          <StatusBar
            translucent={true}
            backgroundColor="rgba(0, 0, 0, 0.2)"
            barStyle="light-content"
           />
          <TabsView/>
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
