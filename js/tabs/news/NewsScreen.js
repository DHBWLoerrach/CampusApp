import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Linking,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import Colors from '../../util/Colors';
import NewsCell from './NewsCell';
import { fetchNews, tabChanged } from './redux';

import DayHeader from '../../util/DayHeader';
import ReloadView from '../../util/ReloadView';
import TabbedSwipeView from '../../util/TabbedSwipeView';
import { feeds } from '../../util/Constants';

function selectPropsFromStore(store) {
  return {
    news: store.news.news,
    tab: store.news.tab,
    isFetching: store.news.isFetching,
    networkError: store.news.networkError
  };
}

class NewsScreen extends Component {
  componentDidMount() {
    this.props.dispatch(fetchNews());
  }

  _getSectionsForEvents(news) {
    if (!news || news.length === 0) return [];

    let sections = [];
    news.forEach(item => {
      month = format(new Date(item.time), 'MMMM yyyy', {
        locale: de
      });

      let index = sections.findIndex(
        section => section.title === month
      );
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
          this.props.navigation.navigate('NewsDetails', {
            news: item,
            topic
          })
        }
      />
    );
  }

  _getPages(news) {
    return feeds.map(feed => {
      let content = null;
      if (!news[feed.key]) {
        // this could occur if there's a server problem with a news page
        content = (
          <ReloadView
            buttonText="Nochmal versuchen"
            message="Es konnten keine Daten geladen werden."
            onPress={() => this.props.dispatch(fetchNews())}
          />
        );
      } else if (news[feed.key].length === 0) {
        content = (
          <ReloadView
            message="Keine Einträge"
            buttonText="Aktualisieren"
            onPress={() => this.props.dispatch(fetchNews())}
          />
        );
      } else if (feed.key === 'events') {
        content = (
          <SectionList
            sections={this._getSectionsForEvents(news[feed.key])}
            keyExtractor={item => 'item' + item.id}
            onRefresh={() => this.props.dispatch(fetchNews())}
            refreshing={this.props.isFetching}
            renderItem={({ item }) =>
              this._renderNewsItem(item, feed.key)
            }
            renderSectionHeader={({ section }) => (
              <DayHeader title={section.title} />
            )}
          />
        );
      } else {
        content = (
          <FlatList
            data={news[feed.key]}
            onRefresh={() => this.props.dispatch(fetchNews())}
            refreshing={this.props.isFetching}
            keyExtractor={item => 'item' + item.id}
            renderItem={({ item }) =>
              this._renderNewsItem(item, feed.key)
            }
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

    if (networkError && Object.keys(news).length === 0) {
      return (
        <ReloadView
          buttonText="News laden"
          onPress={() => this.props.dispatch(fetchNews())}
        />
      );
    }

    return (
      <TabbedSwipeView
        pages={this._getPages(news)}
        selectedIndex={this.props.tab}
        onTabChanged={index => this.props.dispatch(tabChanged(index))}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
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
