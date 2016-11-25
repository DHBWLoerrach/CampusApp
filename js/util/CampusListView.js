// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
  StyleSheet,
  View,
} from 'react-native';

import Colors from './Colors.js';

export default class CampusListView extends Component {
  _renderSeparator(sectionId, rowId) {
    return(<View style={styles.separator} key={rowId}/>);
  }

  render() {
    return(
      <ListView
        automaticallyAdjustContentInsets={false} // iOS: avoid top margin inset
        dataSource={this.props.dataSource}
        renderRow={this.props.renderRow}
        renderSectionHeader={this.props.renderSectionHeader}
        renderSeparator={this._renderSeparator}
        style={styles.listView}>
        {this.props.children}
      </ListView>
    );
  }
}

const styles = StyleSheet.create({
  listView: {
    backgroundColor: 'white',
  },
  separator: {
    backgroundColor: Colors.cellBorder,
    height: StyleSheet.hairlineWidth,
  },
});
