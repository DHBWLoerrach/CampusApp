// @flow
import React, { Component } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';

import deLocale from 'date-fns/locale/de';
import format from 'date-fns/format';

import NewsCell from './NewsCell';
import NewsDetails from './NewsDetails';
import { fetchNews } from './redux';

import NewsItem from '../../util/types.js';
import CampusHeader from '../../util/CampusHeader';
import DayHeader from '../../util/DayHeader';
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

  _getSectionsForEvents(news) {
    if (!news || news.length === 0) return [];

    let month = format(new Date(news[0].time), 'MMMM YYYY', {
      locale: deLocale
    });
    let sections = [{ data: [], title: month }];
    news.forEach(item => {
      month = format(new Date(item.time), 'MMMM YYYY', {
        locale: deLocale
      });
      let lastSection = sections[sections.length - 1];
      if (lastSection.title == month) {
        lastSection.data.push(item);
      } else {
        sections.push({ data: [item], title: month });
      }
    });
    return sections;
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
      let content = null;
      if (feed.key === 'events') {
        content = (
          <SectionList
            contentInset={{ top: 0, left: 0, bottom: 50, right: 0 }}
            sections={this._getSectionsForEvents(news[feed.key])}
            keyExtractor={item => 'item' + item.id}
            renderItem={({ item }) => this._renderNewsItem(item, feed.key)}
            renderSectionHeader={({ section }) => (
              <DayHeader title={section.title} />
            )}
          />
        );
      } else {
        content = (
          <FlatList
            contentInset={{ top: 0, left: 0, bottom: 50, right: 0 }}
            data={news[feed.key]}
            keyExtractor={item => 'item' + item.id}
            renderItem={({ item }) => this._renderNewsItem(item, feed.key)}
          />
        );
      }
      return {
        title: feed.name,
        content
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
