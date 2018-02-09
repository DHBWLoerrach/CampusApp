// @flow
import React, { Component } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';

import NewsCell from './NewsCell';
import NewsDetails from './NewsDetails';
import { fetchNews } from './redux';

import NewsItem from '../../util/types.js';
import CampusHeader from '../../util/CampusHeader';
import ReloadView from '../../util/ReloadView';
import TabbedSwipeView from '../../util/TabbedSwipeView';
import { feeds } from '../../util/Constants';

function selectPropsFromStore(store) {
  return {
    news: store.news.news,
    isFetching: store.news.isFetching,
    networkError: store.news.networkError
  };
}

class NewsScreen extends Component {
  state = { selectedIndex: 0, selectedNewsItem: null };
  _onBackPress = this._onBackPress.bind(this);

  componentWillMount() {
    this.props.dispatch(fetchNews());
  }

  _onNewsItemPressed(newsItem, topic) {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
    }
    this.setState({
      selectedIndex: ['news', 'events', 'stuvdhbwloerrach'].indexOf(topic),
      selectedNewsItem: newsItem
    });
  }

  _onBackPress() {
    if (this.state.selectedNewsItem !== null) {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this._onBackPress
        );
      }
      this.setState({ selectedNewsItem: null });
      return true; // Back button handled
    }
    return false;
  }

  _getItems(news, topic) {
    if (news && topic === 'events') {
      news = news.sort((a, b) => new Date(a.time) - new Date(b.time));
    }
    return news;
  }

  _renderNewsItem(item, topic) {
    return (
      <NewsCell
        news={item}
        topic={topic}
        onPress={() => this._onNewsItemPressed(item, topic)}
      />
    );
  }

  _getPages(news) {
    return feeds.map(feed => {
      return {
        title: feed.name,
        content: (
          <FlatList
            contentInset={{ top: 0, left: 0, bottom: 50, right: 0 }}
            data={this._getItems(news[feed.key], feed.key)}
            keyExtractor={item => 'item' + item.id}
            renderItem={({ item }) => this._renderNewsItem(item, feed.key)}
          />
        )
      };
    });
  }

  _renderScreenContent() {
    const { news, isFetching, networkError } = this.props;

    if (isFetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    const buttonText = 'News laden';
    if (networkError && Object.keys(news).length === 0) {
      return (
        <ReloadView
          buttonText={buttonText}
          onPress={() => this.props.dispatch(fetchNews())}
        />
      );
    }
    return (
      <TabbedSwipeView
        pages={this._getPages(news)}
        selectedIndex={this.state.selectedIndex}
      />
    );
  }

  render() {
    if (this.state.selectedNewsItem !== null) {
      return (
        <NewsDetails
          backAction={this._onBackPress.bind(this)}
          news={this.state.selectedNewsItem}
        />
      );
    }

    return (
      <View style={styles.container}>
        <CampusHeader title="News" style={styles.header} />
        {this._renderScreenContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    elevation: 0
  }
});

export default connect(selectPropsFromStore)(NewsScreen);
