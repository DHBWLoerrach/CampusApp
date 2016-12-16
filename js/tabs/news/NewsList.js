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
import { fetchNewsData } from '../../util/helpers'; //TODO: container component?

export default class NewsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      newsItems: [],
    };

    this._renderRow = this._renderRow.bind(this);
  }

  componentWillMount = async () => {
    try {
      const response = await fetch('https://www.dhbw-loerrach.de/index.php?id=3965&type=105');
      const responseBody = await response.text();
      const newsItems = fetchNewsData(responseBody);

      // TODO: would a ScrollView suffice? we only have < 30 items
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.setState({loading: false, newsItems: ds.cloneWithRows(newsItems)});
    } catch(e) {
      this.setState({loading: false, error: true});
    }
  }

  _renderRow(newsItem: NewsItem) {
    return(<NewsCell news={newsItem} onPress={this.props.onPressNewsItem}/>);
  }

  _renderScreenContent() {
    const {newsItems, loading, error} = this.state;

    if(loading) {
      return(
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    if(error) {
      return(
        <View style={styles.center}>
          <Text>Fehler beim Laden der News</Text>
        </View>
      );
    }

    return(
      <CampusListView
        dataSource={this.state.newsItems} renderRow={this._renderRow}/>
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
