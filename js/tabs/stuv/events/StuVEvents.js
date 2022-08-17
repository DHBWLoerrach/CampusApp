import React, {useCallback, useContext, useState} from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { loadEvents } from '../helper';
import ReloadView from '../../../util/ReloadView';
import ActivityIndicator from '../../../util/DHBWActivityIndicator';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import StuvEventCell from './StuVEventCell';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

export default function StuVEvents() {
  const [isLoading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);
  const navigation = useNavigation();
  const colorContext = useContext(ColorSchemeContext);

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
      <View style={[Styles.StuVEvents.center, {backgroundColor: colorContext.colorScheme.background}]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (events === null || events.length === 0) {
    return (
      <ReloadView
        message="Keine Einträge"
        buttonText="Events laden"
        onPress={refresh}
      />
    );
  }

  return (
    <FlatList
      style={[Styles.StuVEvents.container, {backgroundColor: colorContext.colorScheme.background}]}
      data={events}
      onRefresh={refresh}
      refreshing={isLoading}
      keyExtractor={(item) => 'item' + item._id}
      renderItem={({ item }) => {
        return (
          <StuvEventCell
            event={item}
            onPress={() => navigate(item, navigation)}
          />
        );
      }}
    />
  );
}
