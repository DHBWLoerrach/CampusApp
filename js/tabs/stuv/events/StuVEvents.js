import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  loadEvents,
  unixTimeToDateText,
  unixTimeToTimeText,
} from '../helper';
import ReloadView from '../../../util/ReloadView';
import ActivityIndicator from '../../../util/DHBWActivityIndicator';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import CommonCell from '../../../util/CommonCell';

export default function StuVEvents() {
  const [isLoading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);
  const navigation = useNavigation();

  // when screen is focussed, load data
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  function loadData() {
    setLoading(true);
    loadEvents().then((events) => {
      setEvents(events);
      setLoading(false);
    });
  }

  function refresh() {
    setLoading(true);
    loadData();
  }

  function navigate(event, navigation) {
    navigation.navigate('StuVEventsDetails', { event });
  }

  if (events === null) {
    return <ReloadView buttonText="Events laden" onPress={refresh} />;
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
      data={events}
      onRefresh={refresh}
      refreshing={isLoading}
      keyExtractor={(item) => 'item' + item.title}
      renderItem={({ item }) => {
        console.log(item);
        return (
          <CommonCell
            imageSource={
              item.images.overview
                ? { uri: item.images.overview }
                : require('../../../img/crowd.png')
            }
            title={item.title}
            details={[
              unixTimeToDateText(item.date.from),
              item.date.to
                ? unixTimeToTimeText(item.date.from) +
                  ' bis ' +
                  unixTimeToTimeText(item.date.to) +
                  ' Uhr'
                : unixTimeToTimeText(item.date.from) + ' Uhr',
            ]}
            description={item.text}
            onPress={() => navigate(item, navigation)}
          />
        );
      }}
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
