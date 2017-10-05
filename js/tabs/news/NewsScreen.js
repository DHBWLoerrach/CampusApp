// @flow
import React, { Component } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  ScrollView,
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
      selectedIndex: topic === 'news' ? 0 : 1,
      selectedNewsItem: newsItem
    });
  }

  _onBackPress() {
    if (this.state.selectedNewsItem !== null) {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);
      }
      this.setState({ selectedNewsItem: null });
      return true; // Back button handled
    }
    return false;
  }

  _renderNewsItems(news, topic) {
    if (news) {
      if (topic === 'events') {
        news = news.sort((a, b) => new Date(a.time) - new Date(b.time));
      }
      return news.map((newsItem, index) => (
        <NewsCell
          key={'t' + index}
          news={newsItem}
          topic={topic}
          onPress={() => this._onNewsItemPressed(newsItem, topic)}
        />
      ));
    } else {
      return <View />;
    }
  }

  _getPages(news) {
    return feeds.map(feed => {
      return {
        title: feed.name,
        content: (
          <ScrollView bounces={false}>
            {this._renderNewsItems(news[feed.key], feed.key)}
          </ScrollView>
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
    if (networkError && !news.length) {
      return (
        <ReloadView
          buttonText={buttonText}
          onPress={() => this.props.dispatch(fetchNews())}
        />
      );
    }
    return (
      <TabbedSwipeView
        count={2}
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
