import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from '@react-navigation/native';

import NewsCell from './NewsCell';
import ReloadView from '../../util/ReloadView';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import FetchManager from '../../util/fetcher/FetchManager';

function getContent(data, type, refresh, isLoading, navigate, ref) {
  let content = null;
  if (!data) {
    // this could occur if there's a server problem with a news page
    content = (
      <ReloadView
        buttonText="Nochmal versuchen"
        message="Es konnten keine Daten geladen werden."
        onPress={refresh}
      />
    );
  } else if (data.length === 0) {
    content = (
      <ReloadView
        message="Keine Einträge"
        buttonText="Aktualisieren"
        onPress={refresh}
      />
    );
  } else {
    content = (
      <FlatList
        style={styles.container}
        ref={ref}
        data={data}
        onRefresh={refresh}
        refreshing={isLoading}
        keyExtractor={(item) => 'item' + item.id}
        renderItem={({ item }) => (
          <NewsCell
            news={item}
            topic={type}
            onPress={() => {
              // news item: remove equals function and convert time to string value
              // this will keep news item serializable (otherwise a warning will pop up)
              // --> TODO: cleanup design ?
              item.equals = undefined;
              item.time = `${item.time}`;
              navigate('NewsDetails', { news: item, topic: type });
            }}
          />
        )}
      />
    );
  }
  return content;
}

export default ({ type }) => {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [data, setData] = useState(null);
  const { navigate } = useNavigation();
  const ref = React.useRef(null);
  useScrollToTop(ref);

  // load fresh data from web and store it locally
  async function refresh() {
    setLoading(true);
    setNetworkError(false);
    const items = await FetchManager.fetch(type, true);
    if (items === 'networkError') {
      //TODO!!!
      setNetworkError(true);
    } else {
      setData(items);
    }
    setLoading(false);
  }

  async function loadData() {
    setLoading(true);
    const items = await FetchManager.fetch(type);
    if (items) {
      setData(items);
      setLoading(false);
    } else {
      refresh();
    }
  }

  // when screen is focussed, load data and update header title
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data && hasNetworkError) {
    return (
      <View style={styles.container}>
        <ReloadView buttonText="News laden" onPress={refresh} />
      </View>
    );
  }

  return getContent(data, type, refresh, isLoading, navigate, ref);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  header: {
    elevation: 0,
  },
});
