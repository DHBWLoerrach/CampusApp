import React from 'react';
import { Alert, Platform } from 'react-native';
import HeaderIcon from '../../util/HeaderIcon';

const textCanteenInfo =
  'Mo-Fr geöffnet 8.30-13.45 Uhr \n' +
  'Mittagessen: 11.45-13.30 Uhr\n\n' +
  'Die Preise werden für die von Dir gewählte Personengruppe ' +
  'angezeigt (siehe Services > Einstellungen).\n\n' +
  'Tippe auf ein Gericht, um Informationen über Inhaltsstoffe anzeigen zu lassen.';

const textNfcInfo =
  '\n\nUm das Guthaben Deines DHBW-Ausweises auszulesen, ' +
  'muss NFC aktiviert sein (sofern vom Handy unterstützt).\n' +
  'Schau dazu in den Einstellungen unter "Drahtlos & Netzwerke" nach.\n' +
  'Danach brauchst Du einfach nur den Ausweis an die Rückseite Deines Handys ' +
  'zu halten.';

export default () => (
  <HeaderIcon
    onPress={() => {
      let textBody = textCanteenInfo;
      if (Platform.OS === 'android') textBody += textNfcInfo;
      return Alert.alert('Mensa Hangstraße 46-50', textBody);
    }}
    icon="help-outline"
  />
);
