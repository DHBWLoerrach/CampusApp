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
import FetchManager from '../../util/fetcher/FetchManager';

function getContent(data, type, refresh, isLoading, navigate) {
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
        data={data}
        onRefresh={refresh}
        refreshing={isLoading}
        keyExtractor={(item) => 'item' + item.id}
        renderItem={({ item }) => (
          <NewsCell
            news={item}
            topic={type}
            onPress={() =>
              navigate('NewsDetails', { news: item, topic: type })
            }
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
    const items = await FetchManager.fetch(type);
    if (items) {
      setData(items);
      setLoading(false);
    } else refresh();
  }

  // load data when this component is mounted
  useEffect(() => {
    if (data === null) loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} />
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

  return getContent(data, type, refresh, isLoading, navigate);
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
