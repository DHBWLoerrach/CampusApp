// @flow
'use strict';

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';
import TabbedSwipeView from '../../util/TabbedSwipeView';

import About from './About';
import Disclaimer from './Disclaimer';
import Imprint from './Imprint';
import Privacy from './Privacy';

export default class ImprintScreen extends Component {
  render() {
    const pages = [{
        title: 'Impressum',
        content: <ScrollView><Imprint/></ScrollView>,
      }, {
        title: 'Haftung',
        content: <ScrollView><Disclaimer/></ScrollView>,
      }, {
        title: 'Datenschutz',
        content: <ScrollView><Privacy/></ScrollView>,
      }, {
        title: 'Über',
        content: <ScrollView><About/></ScrollView>,
      },
    ];

    return (
      <View style={styles.container}>
        <CampusHeader title='Impressum' style={styles.header}/>
        <TabbedSwipeView pages={pages}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    elevation: 0, // disable shadow below header to avoid border above pager tabs
  },
  container: {
    flex: 1,
  },
});
