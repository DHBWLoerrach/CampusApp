import React from 'react';
import {
  Alert,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { unixTimeToDateText, unixTimeToTimeText } from '../helper';
import Colors from '../../../util/Colors';
import ResponsiveImage from '../../../util/ResponsiveImage';
import StuVEventMap from './StuVEventMap';

export default function StuVEventsDetails({ route }) {
  const event = route.params.event;
  const navigation = useNavigation();
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
            {`${unixTimeToTimeText(
              event.date.from
            )} bis ${unixTimeToTimeText(event.date.to)} Uhr`}
          </Text>
        ) : (
          <Text style={styles.date}>
            {unixTimeToTimeText(event.date.from)} Uhr
          </Text>
        )}
        {event.price ? (
          <Text style={styles.date}>Preis: {event.price}</Text>
        ) : null}
        {event.registration.required ? (
          <Text style={styles.date}>
            Anzahl Teilnehmer*innen: {event.registered}
          </Text>
        ) : null}
        {
          <Text style={styles.date}>
            Maximale Plätze: {event.registration.hasLimit ? event.registration.limit : "unbegrenzt"}
          </Text>
        }
        <Text style={styles.text}>{event.text}</Text>
        {event.registration.required ? (
          <Text style={styles.date}>
            Anmeldefrist:{' '}
            {unixTimeToDateText(event.registration.until)}
          </Text>
        ) : null}
        {/* {event.registerLink ? (
          <View style={styles.button}>
            <Button
              disabled={event.max_limit < event.registered}
              title="Anmelden"
              color={Colors.dhbwRed}
              onPress={() =>
                navigation.navigate('StuVEventsRegister', {
                  event: event,
                })
              }
            />
            <Button
              title="Abmelden"
              color={Colors.lightGray}
              onPress={() =>
                navigation.navigate('StuVEventsUnregister', {
                  event: event,
                })
              }
            />
          </View>
        ) : null} */}
        {event.address.type === "ONLINE" ?
          (<Text style={styles.date}>Online-Link: {event.address.link}</Text>) : null}
      </View>
      {event.address.type === "PRESENCE" ?
        (<StuVEventMap
          latitude={event.address.latitude}
          longitude={event.address.longitude}
          venue={event.address.name}
        />) : null}
    </ScrollView>
  );
}

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
    flexGrow: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'baseline',
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
