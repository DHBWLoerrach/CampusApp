import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { loadEvents } from '../helper';
import ReloadView from '../../../util/ReloadView';
import ActivityIndicator from '../../../util/DHBWActivityIndicator';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import StuvEventCell from './StuVEventCell';

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
          <StuvEventCell event={item} onPress={() => navigate(item, navigation)} />
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
