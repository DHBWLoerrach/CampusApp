// @flow
'use strict';

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import Submenu from './Submenu';

export default class ServiceScreen extends Component {
  _getSubmenuItems() {
    var submenuItems = [{
      label: "Service-Zugänge",
      icon: require('./img/screen.png'),
    },];
    return submenuItems;
  }

  render() {
    return(
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Submenu menuItems={this._getSubmenuItems()}/>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    marginTop: 20,
  }
});
