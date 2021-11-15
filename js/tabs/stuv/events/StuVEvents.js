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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (events === null || events.length === 0) {
    return <ReloadView
      message="Keine Einträge"
      buttonText="Events laden"
      onPress={refresh} />;
  }

  return (
    <FlatList
      style={styles.container}
      data={events}
      onRefresh={refresh}
      refreshing={isLoading}
      keyExtractor={(item) => 'item' + item._id}
      renderItem={({ item }) => {
        return (
          <CommonCell
            imageSource={
              item.images.overview
                ? { uri: item.images.overview.src }
                : require('../../../img/crowd.png')
            }
            title={item.name}
            imageStyle={{ resizeMode: 'cover', height: '100%' }}
            details={[
              unixTimeToDateText(item.date.from),
              item.date.to
                ? unixTimeToTimeText(item.date.from) +
                ' bis ' +
                unixTimeToTimeText(item.date.to) +
                ' Uhr'
                : unixTimeToTimeText(item.date.from) + ' Uhr',
            ]}
            description={item.description}
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
