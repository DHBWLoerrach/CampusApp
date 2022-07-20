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
import ResponsiveImage from '../../../util/ResponsiveImage';
import StuVEventMap from './StuVEventMap';
import Styles from '../../../Styles/StyleSheet';

export default function StuVEventsDetails({ route }) {
  const event = route.params.event;
  const {
    name,
    description,
    address,
    images,
    price,
    registration,
    registered,
    registerLink,
    max_limit,
    date: { from, to },
  } = event;
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

  let responsiveImage = null;
  if (images.banner) {
    responsiveImage = <ResponsiveImage image={images.banner.src} />;
  }

  const formattedTime = to
    ? `${unixTimeToTimeText(from)} bis ${unixTimeToTimeText(to)} Uhr`
    : `${unixTimeToTimeText(from)} Uhr`;
  const priceInfo = price ? <Text>Preis: {price}</Text> : null;
  const registrationInfo = registration.required ? (
    <Text>Anzahl Teilnehmer*innen: {registered}</Text>
  ) : null;
  const limitInfo = registration.hasLimit
    ? registration.limit
    : 'unbegrenzt';
  let registrationUntil = null;
  if (registration.required) {
    registrationUntil = (
      <Text>
        Anmeldefrist: {unixTimeToDateText(registration.until)}
      </Text>
    );
  }
  let registrationView = null;
  if (registerLink) {
    registrationView = (
      <View style={Styles.StuVEventsDetails.button}>
        <Button
          disabled={max_limit < registered}
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
    );
  }
  const onlineLink =
    address.type === 'ONLINE' ? (
      <Text>Online-Link: {address.link}</Text>
    ) : null;
  const mapView =
    address.type === 'PRESENCE' ? (
      <StuVEventMap
        latitude={address.latitude}
        longitude={address.longitude}
        venue={address.name}
      />
    ) : null;
  return (
    <ScrollView style={Styles.StuVEventsDetails.scrollView}>
      {responsiveImage}
      <View style={Styles.StuVEventsDetails.container}>
        <Text style={Styles.StuVEventsDetails.headline}>{name}</Text>
        <Text>{description}</Text>
        <Text>{unixTimeToDateText(from)}</Text>
        <Text>{formattedTime}</Text>
        {priceInfo}
        {registrationInfo}
        <Text>Maximale Plätze: {limitInfo}</Text>
        {registrationUntil}
        {registrationView}
        {onlineLink}
      </View>
      {mapView}
    </ScrollView>
  );
}