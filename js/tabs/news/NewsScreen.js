// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
  StyleSheet,
  View,
} from 'react-native';

import NewsCell from './NewsCell';
import Colors from '../../util/Colors';

import NewsItem from '../../util/types.js';

export default class NewsScreen extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([
        {heading: 'News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1', subheading: 'Foobar'},
        {heading: 'Angespannte Parkplatzsituation zum komm Studieninformationstag', subheading: 'Blabla'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
      ])
    };
  }

  _renderRow(newsItem: NewsItem) {
    return(<NewsCell news={newsItem}/>);
  }

  _renderSeparator(sectionId, rowId) {
    return(<View style={styles.separator} key={rowId}/>);
  }

  render() {
    return(
      <ListView style={{backgroundColor: 'white'}}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        renderSeparator={this._renderSeparator}
      />
    );
  }
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: Colors.cellBorder,
    height: 1,
  },
});
