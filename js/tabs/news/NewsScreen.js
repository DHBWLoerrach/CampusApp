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

function selectPropsFromStore(store) {
  return {
    news: store.news.news,
    isFetching: store.news.isFetching,
    networkError: store.news.networkError
  };
}

class NewsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { selectedNewsItem: null };

    this._onBackPress = this._onBackPress.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(fetchNews());
  }

  _onNewsItemPressed(newsItem) {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
    }
    this.setState({ selectedNewsItem: newsItem });
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

  _renderNewsItems(news) {
    return news.map((newsItem, index) => (
      <NewsCell
        key={'t' + index}
        news={newsItem}
        onPress={() => this._onNewsItemPressed(newsItem)}
      />
    ));
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
      <ScrollView bounces={false}>{this._renderNewsItems(news)}</ScrollView>
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
        <CampusHeader title="News" />
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
  }
});

export default connect(selectPropsFromStore)(NewsScreen);
