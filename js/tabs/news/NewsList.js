// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import NewsCell from './NewsCell';
import NewsItem from '../../util/types.js';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';

export default class NewsList extends Component {
  constructor(props) {
    super(props);

    this._renderRow = this._renderRow.bind(this);
  }

  _renderRow(newsItem: NewsItem) {
    return(<NewsCell news={newsItem} onPress={this.props.onPressNewsItem}/>);
  }

  _renderScreenContent() {
    const {news, isFetching, networkError} = this.props;

    if(isFetching) {
      return(
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    if(networkError) {
      return(
        <View style={styles.center}>
          <Text>Fehler beim Laden der News</Text>
        </View>
      );
    }

    // TODO: would a ScrollView suffice? we only have < 30 items
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return(
      <CampusListView
        dataSource={ds.cloneWithRows(news)} renderRow={this._renderRow}/>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <CampusHeader title="News"/>
        {this._renderScreenContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
