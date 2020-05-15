import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import NewsCell from './NewsCell';

import DayHeader from '../../util/DayHeader';
import ReloadView from '../../util/ReloadView';
import TabbedSwipeView from '../../util/TabbedSwipeView';
import { feeds } from '../../util/Constants';

import {
  fetchNewsFromWeb,
  loadNewsFromStore,
  saveNewsToStore,
} from './store';

function getSectionsForEvents(news) {
  if (!news || news.length === 0) return [];

  let sections = [];
  news.forEach((item) => {
    month = format(new Date(item.time), 'MMMM yyyy', {
      locale: de,
    });

    let index = sections.findIndex(
      (section) => section.title === month
    );
    if (index === -1) {
      sections.push({ title: month, data: [item] });
    } else {
      sections[index].data.push(item);
    }
  });
  return sections;
}

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

let lastDataFetch = 0;

export default function NewsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [news, setNews] = useState(null);
  const { navigate } = useNavigation();

  // load fresh data from web and store it locally
  async function refresh() {
    setLoading(true);
    setNetworkError(false);
    const data = await fetchNewsFromWeb();
    if (data === 'networkError') {
      setNetworkError(true);
    } else {
      saveNewsToStore(data);
      lastDataFetch = new Date().getTime();
      setNews(data);
    }
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (new Date().getTime() > lastDataFetch + 1000 * 60 * 60) {
        setLoading(true);
        loadData();
      }
    }, [])
  );

  // load data from local store or from web if store is emtpy
  async function loadData() {
    let data = await loadNewsFromStore();
    if (data !== null) {
      lastDataFetch = new Date().getTime();
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
