// @flow
import React, { Component } from 'react';
import {
  ActivityIndicator,
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
import { fetchNews } from './redux';

import NewsItem from '../../util/types.js';
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
  componentWillMount() {
    this.props.dispatch(fetchNews());
  }

  _getSectionsForEvents(news) {
    if (!news || news.length === 0) return [];

    let sections = [];
    news.forEach(item => {
      month = format(new Date(item.time), 'MMMM YYYY', {
        locale: deLocale
      });

      let index = sections.findIndex(section => section.title === month);
      if (index === -1) {
        sections.push({ title: month, data: [item] });
      } else {
        sections[index].data.push(item);
      }
    });
    return sections;
  }

  _renderNewsItem(item, topic) {
    return (
      <NewsCell
        news={item}
        topic={topic}
        onPress={() =>
          this.props.navigation.navigate('NewsDetails', { news: item })
        }
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
    return <TabbedSwipeView pages={this._getPages(news)} />;
  }

  render() {
    return (
      <View style={styles.container}>{this._renderScreenContent()}</View>
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
