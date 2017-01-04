// @flow
'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Platform,
  Text,
  View,
} from 'react-native';

import { connect } from 'react-redux';

import CampusHeader from '../../util/CampusHeader';

import CanteenDayListView from './CanteenDayListView';

const textCanteenInfo =
  'Mo-Fr geöffnet 8.30-13.45 Uhr \n' +
  'Mittagessen: 11.45-13.30 Uhr\n\n' +
  'Die Preise werden für die gewählte Rolle ' +
  '(z.B. Student/in, Mitarbeiter/in) angezeigt. ' +
  'Die Rolle kann jederzeit unter Info > Einstellungen geändert werden.\n\n' +
  'Tippe auf ein Gericht, um Informationen über Inhaltsstoffe anzeigen zu lassen';

const textNfcInfo =
  '\n\nUm das Guthaben Deines DHBW-Ausweises auszulesen, ' +
  'muss NFC aktiviert sein (sofern vom Handy unterstützt).\n' +
  'Schau dazu in den Einstellungen unter "Drahtlos & Netzwerke" nach.\n' +
  'Danach brauchst Du einfach nur den Ausweis an die Rückseite Deines Handys ' +
  'zu halten.';

function selectPropsFromStore(store) {
  return {
    selectedRole: store.settings.selectedRole,
  };
}

class CanteenScreen extends Component {
  _onPress() {
    let textBody = textCanteenInfo;
    if(Platform.OS === 'android') textBody += textNfcInfo;
    return Alert.alert('Mensa Hangstraße 46-50', textBody);
  }

  render() {
    const rightActionItem = {
      title: 'Info',
      icon: require('./img/question.png'),
      onPress: this._onPress,
      show: 'always', // needed for Android
    };

    return (
      <View>
        <CampusHeader title='Mensa' rightActionItem={rightActionItem}/>
        <CanteenDayListView role={this.props.selectedRole}/>
      </View>
    );
  }
}

export default connect(selectPropsFromStore)(CanteenScreen);
