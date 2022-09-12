import React, {useContext} from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { unixTimeToDateText, unixTimeToTimeText } from '../helper';
import ResponsiveImage from '../../../util/ResponsiveImage';
import StuVEventMap from './StuVEventMap';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";
import UIButton from "../../../ui/UIButton";

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
  const colorContext = useContext(ColorSchemeContext);

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

  //const priceInfo = price ? <Text>Preis: {price}</Text> : null;

  /*const registrationInfo = registration.required ? (
    <Text>Anzahl Teilnehmer*innen: {registered}</Text>
  ) : null;*/

  const limitInfo = registration.hasLimit ? registration.limit : 'Unbegrenzt';

  let registrationUntil = null;
  if (registration.required) {
    registrationUntil = (
      <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.details]}>
        Anmeldefrist: {unixTimeToDateText(registration.until)}
      </Text>
    );
  }

  /*let registrationView = null;
  if (registerLink) {
    registrationView = (
      <View style={Styles.StuVEventsDetails.button}>
        <Button
          disabled={max_limit < registered}
          title="Anmelden"
          color={colorContext.colorScheme.dhbwRed}
          onPress={() =>
            navigation.navigate('StuVEventsRegister', {
              event: event,
            })
          }
        />
        <Button
          title="Abmelden"
          color={colorContext.colorScheme.lightGray}
          onPress={() =>
            navigation.navigate('StuVEventsUnregister', {
              event: event,
            })
          }
        />
      </View>
    );
  }*/

  const onlineLink =
    address.type === 'ONLINE' ? (
        <View style={[Styles.StuVEventDetails.details, {alignSelf: "center"}]}>
            <UIButton size="small" onClick={() => Linking.openURL(address.link)}>Jetzt online teilnehmen</UIButton>
        </View>
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
      <View style={{flex: 1, flexDirection: "column", justifyContent: "space-between"}}>
          <ScrollView style={{backgroundColor: colorContext.colorScheme.background}}>
              {responsiveImage}

              <View style={Styles.StuVEventsDetails.container}>
                  <Text style={[{color: colorContext.colorScheme.dhbwRed}, Styles.StuVEventDetails.headline]}>{name}</Text>

                  {/*Date and Time*/}
                  <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.details]}>{unixTimeToDateText(from)}</Text>
                  <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.details]}>{formattedTime}</Text>

                  {/*Registration*/}
                  <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.details]}>Maximale Teilnehmer: {limitInfo}</Text>
                  {registrationUntil}

                  {/*Online URL or Address*/}
                  <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.details]}>
                      {address.type === "ONLINE" ?
                          "Wo: Online auf " + address.platform :
                          "Wo: Am " + address.name
                      }
                  </Text>

                  {/*Description*/}
                  <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventDetails.description]}>{description}</Text>

                  {onlineLink}

              </View>
          </ScrollView>
          <View>
              {mapView}
          </View>
      </View>

  );
}
