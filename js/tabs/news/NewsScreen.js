// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
} from 'react-native';

import CampusListView from '../../util/CampusListView';
import Colors from '../../util/Colors';
import NewsItem from '../../util/types.js';

import NewsCell from './NewsCell';

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

  render() {
    return(
      <CampusListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
      />
    );
  }
}
