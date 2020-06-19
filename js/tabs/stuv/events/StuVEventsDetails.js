import React from 'react';
import {
  Alert,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  requireNativeComponent,
} from 'react-native';
import { unixTimeToDateText, unixTimeToTimeText } from '../helper';
import Colors from '../../../util/Colors';
import ResponsiveImage from '../../../util/ResponsiveImage';
import StuVEventMap from './StuVEventMap';

function StuVEventsDetails({ route }) {
  const event = route.params.event;

  function openRegisterLink() {
    Linking.canOpenURL(event.registerLink).then((result) => {
      if (!result) {
        Alert.alert(
          'Ungültiger Link',
          'Leider kann der Link nicht geöffnet werden.'
        );
        return;
      }
      Linking.openURL(event.registerLink);
    });
  }

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <ScrollView style={styles.scrollView}>
        {event.images.banner ? (
          <ResponsiveImage image={event.images.banner} />
        ) : null}
        <View style={styles.container}>
          <Text style={styles.headline}>{event.title}</Text>
          <Text style={styles.date}>
            {unixTimeToDateText(event.date.from)}
          </Text>
          {event.date.to ? (
            <Text style={styles.date}>
              {unixTimeToTimeText(event.date.from)} bis{' '}
              {unixTimeToTimeText(event.date.to)} Uhr
            </Text>
          ) : (
            <Text style={styles.date}>
              {unixTimeToTimeText(event.date.from)} Uhr
            </Text>
          )}
          {event.price ? (
            <Text style={styles.date}>Preis: {event.price}</Text>
          ) : null}
          <Text style={styles.text}>{event.text}</Text>
          {event.date.registrationUntil ? (
            <Text style={styles.date}>
              Anmeldefrist:{' '}
              {unixTimeToDateText(event.date.registrationUntil)}{' '}
              {unixTimeToTimeText(event.date.registrationUntil)}
            </Text>
          ) : null}
          {event.registerLink ? (
            <View style={styles.button}>
              <Button
                title="Anmelden"
                color={Colors.dhbwRed}
                onPress={openRegisterLink}
              />
            </View>
          ) : null}
        </View>
        <StuVEventMap
          latitude={event.address.latitude}
          longitude={event.address.longitude}
          venue={event.address.name}
        />
      </ScrollView>
    </View>
  );
}
export default StuVEventsDetails;

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  container: {
    padding: 10,
    backgroundColor: 'white',
    zIndex: 2,
  },
  button: {
    marginTop: 10,
  },
  headline: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  text: {
    color: '#262626',
  },
  date: {
    color: 'black',
    fontWeight: 'bold',
  },
});
