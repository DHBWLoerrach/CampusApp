import React, {useCallback, useContext, useState} from 'react';
import { FlatList, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from '@react-navigation/native';

import NewsCell from './NewsCell';
import ReloadView from '../../util/ReloadView';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import FetchManager from '../../util/fetcher/FetchManager';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default ({ type }) => {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [data, setData] = useState(null);
  const { navigate } = useNavigation();
  const ref = React.useRef(null);
  const colorContext = useContext(ColorSchemeContext);
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
      <View style={[Styles.NewsList.center, {backgroundColor: colorContext.colorScheme.background}]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data && hasNetworkError) {
    return (
      <View style={[Styles.NewsList.container, {backgroundColor: colorContext.colorScheme.background}]}>
        <ReloadView buttonText="News laden" onPress={refresh} />
      </View>
    );
  }

  const getContent = (data, type, refresh, isLoading, navigate, ref) => {
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
              style={[Styles.NewsList.container, {backgroundColor: colorContext.colorScheme.background}]}
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

  return getContent(data, type, refresh, isLoading, navigate, ref);
};