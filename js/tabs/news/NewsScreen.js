// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  BackAndroid,
  Platform,
  ScrollView,
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

  _renderNewsItems(news) {
    return (
      news.map(
        (newsItem, index) =>
          <NewsCell key={'t' + index} news={newsItem}
            onPress={() => this._onNewsItemPressed(newsItem)}/>
      )
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

    return (
      <ScrollView bounces={false}>{this._renderNewsItems(news)}</ScrollView>
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
