import React from 'react';
import { Alert, Platform } from 'react-native';
import HeaderIcon from '../../util/HeaderIcon';

const textCanteenInfo =
  'Mo-Fr geöffnet 8.30-13.45 Uhr \n' +
  'Mittagessen: 11.45-13.30 Uhr\n\n' +
  'Die Preise werden für die von Dir gewählte Personengruppe ' +
  'angezeigt (siehe Services > Einstellungen).\n\n' +
  'Tippe auf ein Gericht, um Informationen über Inhaltsstoffe anzeigen zu lassen.';

export default () => (
  <HeaderIcon
    onPress={() => {
      return Alert.alert('Mensa Hangstraße 46-50', textCanteenInfo);
    }}
    icon="help-outline"
  />
);
