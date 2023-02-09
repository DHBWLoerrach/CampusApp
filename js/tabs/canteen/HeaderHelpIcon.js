import React from 'react';
import { Alert } from 'react-native';
import HeaderIcon from '../../util/HeaderIcon';

const textCanteenInfo =
  'Mo-Fr geöffnet 9.30-13.45 Uhr \n' +
  'Mittagessen: 11.45-13.30 Uhr\n\n' +
  'Die Preise werden für die von Dir gewählte Personengruppe ' +
  'angezeigt (siehe Services > Einstellungen).';

export default () => (
  <HeaderIcon
    onPress={() => {
      return Alert.alert('Mensa Hangstraße 46-50', textCanteenInfo);
    }}
    icon="help-outline"
  />
);
