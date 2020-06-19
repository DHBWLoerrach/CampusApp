import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import {
  loadEvents,
  unixTimeToDateText,
  unixTimeToTimeText,
} from '../helper';
import ReloadView from '../../../util/ReloadView';
import { useNavigation } from '@react-navigation/native';
import CommonCell from '../../../util/CommonCell';

function StuVEvents() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
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

  if (events == null) {
    return <ReloadView buttonText="Events laden" onPress={refresh} />;
  }

  return (
    <FlatList
      data={events}
      onRefresh={refresh}
      refreshing={loading}
      keyExtractor={(item) => 'item' + item.title}
      renderItem={({ item }) => (
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
      )}
    />
  );
}
export default StuVEvents;
