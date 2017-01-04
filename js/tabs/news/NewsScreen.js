// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  BackAndroid,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { connect } from 'react-redux';

import NewsCell from './NewsCell';
import NewsDetails from './NewsDetails';
import { fetchNews } from './redux';

import NewsItem from '../../util/types.js';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';

function selectPropsFromStore(store) {
  return {
    news: store.news.news,
    isFetching: store.news.isFetching,
    networkError: store.news.networkError,
  };
}

class NewsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {selectedNewsItem: null,};

    this._onBackPress = this._onBackPress.bind(this);
    this._renderRow = this._renderRow.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(fetchNews());
  }

  _onNewsItemPressed(newsItem) {
    if(Platform.OS === 'android'){
      BackAndroid.addEventListener('hardwareBackPress', this._onBackPress);
    }
    this.setState({ selectedNewsItem: newsItem });
  }

  _onBackPress() {
    if(this.state.selectedNewsItem !== null){
      if(Platform.OS === 'android'){
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackPress);
      }
      this.setState({selectedNewsItem: null})
      return true; // Back button handled
    }
    return false;
  }

  _renderRow(newsItem: NewsItem) {
    return (
      <NewsCell news={newsItem} onPress={() => this._onNewsItemPressed(newsItem)}/>
    );
  }

  _renderScreenContent() {
    const { news, isFetching, networkError } = this.props;

    if(isFetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    if(networkError && !news.length) { // TODO: distinguish between network and other errors
      return (
        <View style={styles.center}>
          <Text>Fehler beim Laden der News</Text>
        </View>
      );
    }

    // TODO: would a ScrollView suffice? we only have < 30 items
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return (
      <CampusListView
        dataSource={ds.cloneWithRows(news)} renderRow={this._renderRow}/>
    );
  }

  render() {
    if(this.state.selectedNewsItem !== null) {
      return (
        <NewsDetails
          backAction={this._onBackPress.bind(this)}
          news={this.state.selectedNewsItem}/>
      );
    };

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

export default connect(selectPropsFromStore)(NewsScreen);
