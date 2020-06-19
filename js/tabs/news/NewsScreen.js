import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import NewsCell from './NewsCell';

import ReloadView from '../../util/ReloadView';
import TabbedSwipeView from '../../util/TabbedSwipeView';
import { feeds } from '../../util/Constants';
import FetchManager, {
  DHBW_EVENTS,
  DHBW_NEWS,
} from '../../util/fetcher/FetchManager';

function renderNewsItem(item, topic, navigate) {
  return (
    <NewsCell
      news={item}
      topic={topic}
      onPress={() => navigate({ news: item, topic })}
    />
  );
}

function getPages(news, isLoading, refresh, navigate) {
  return feeds.map((feed) => {
    let content = null;
    if (!news[feed.key]) {
      // this could occur if there's a server problem with a news page
      content = (
        <ReloadView
          buttonText="Nochmal versuchen"
          message="Es konnten keine Daten geladen werden."
          onPress={refresh}
        />
      );
    } else if (news[feed.key].length === 0) {
      content = (
        <ReloadView
          message="Keine Einträge"
          buttonText="Aktualisieren"
          onPress={refresh}
        />
      );
    } else if (feed.key === 'events') {
      content = (
        <FlatList
          data={news[feed.key]}
          onRefresh={refresh}
          refreshing={isLoading}
          keyExtractor={(item) => 'item' + item.id}
          renderItem={({ item }) =>
            renderNewsItem(item, feed.key, navigate)
          }
        />
      );
    } else {
      content = (
        <FlatList
          data={news[feed.key]}
          onRefresh={refresh}
          refreshing={isLoading}
          keyExtractor={(item) => 'item' + item.id}
          renderItem={({ item }) =>
            renderNewsItem(item, feed.key, navigate)
          }
        />
      );
    }
    return {
      title: feed.name,
      content,
    };
  });
}

export default function NewsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [news, setNews] = useState(null);
  const { navigate } = useNavigation();

  // load fresh data from web and store it locally
  async function refresh() {
    setLoading(true);
    setNetworkError(false);
    const data = [];
    data['news'] = await FetchManager.fetch(DHBW_NEWS, true);
    data['events'] = await FetchManager.fetch(DHBW_EVENTS, true);
    if (data === 'networkError') {
      //TODO!!!
      setNetworkError(true);
    } else {
      setNews(data);
    }
    setLoading(false);
  }

  async function loadData() {
    const data = [];
    data['news'] = await FetchManager.fetch(DHBW_NEWS);
    data['events'] = await FetchManager.fetch(DHBW_EVENTS);
    if (data.length === 2) {
      setNews(data);
      setLoading(false);
    } else refresh();
  }

  // load data when this component is mounted
  useEffect(() => {
    if (news === null) loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} />
      </View>
    );
  }

  if (!news && hasNetworkError) {
    return (
      <View style={styles.container}>
        <ReloadView buttonText="News laden" onPress={refresh} />
      </View>
    );
  }

  function gotoNewsItem(params) {
    navigate('NewsDetails', params);
  }

  return (
    <View style={styles.container}>
      <TabbedSwipeView
        pages={getPages(news, isLoading, refresh, gotoNewsItem)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    elevation: 0,
  },
});
