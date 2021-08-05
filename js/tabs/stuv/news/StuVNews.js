import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import ReloadView from '../../../util/ReloadView';
import ActivityIndicator from '../../../util/DHBWActivityIndicator';
import { loadNews, unixTimeToDateText } from '../helper';
import CommonCell from '../../../util/CommonCell';

export default function StuVNews() {
  const [news, setNews] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const navigation = useNavigation();

  // when screen is focussed, load data
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  function refresh() {
    setLoading(true);
    loadData();
  }

  function loadData() {
    setLoading(true);
    loadNews().then((news) => {
      setNews(news);
      setLoading(false);
    });
  }

  function navigate(news, navigation) {
    navigation.navigate('StuVNewsDetails', { news });
  }

  if (news === null) {
    return <ReloadView buttonText="News laden" onPress={refresh} />;
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={news}
      onRefresh={refresh}
      refreshing={isLoading}
      keyExtractor={(item) => 'item' + item.title}
      renderItem={({ item }) => (
        <CommonCell
          title={item.title}
          details={item.date ? [unixTimeToDateText(item.date)] : []}
          imageSource={
            item.images.overview
              ? { uri: item.images.overview }
              : require('../../../img/crowd.png')
          }
          description={item.text}
          onPress={() => navigate(item, navigation)}
        />
      )}
    />
  );
}

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
});
