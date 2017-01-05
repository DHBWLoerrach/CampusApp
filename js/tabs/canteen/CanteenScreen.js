// @flow
'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { connect } from 'react-redux';

import CampusHeader from '../../util/CampusHeader';
import TabbedSwipeView from '../../util/TabbedSwipeView';

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

    const meal1 = {name: 'Schnitzel', addition: ['Dioxin','Chlor'],vegetarian: false, prices: [{price: '2€'},{price: '3€'},{price: '4€'}]};
    const meal2 = {name: 'Nudeln', vegetarian: true, prices: [{price: '1,50€'},{price: '1,90€'},{price: '2€'}]};
    const meal3 = {name: 'Salat', vegetarian: true, prices: [{price: '0,90€'},{price: '1,10€'},{price: '1,30€'}]};
    const meals = [meal1,meal2,meal3];

    const pages = [{
        title: 'Mo 22.12',
        content: <CanteenDayListView meals={meals} role={this.props.selectedRole}/>,
      }, {
        title: 'Di 23.12',
        content: <CanteenDayListView meals={meals} role={this.props.selectedRole}/>,
      }, {
        title: 'Mi 24.12',
        content: <CanteenDayListView meals={meals} role={this.props.selectedRole}/>,
      }, {
        title: 'Do 25.12',
        content: <CanteenDayListView meals={meals} role={this.props.selectedRole}/>,
      }, {
        title: 'Fr 26.12',
        content: <CanteenDayListView meals={meals} role={this.props.selectedRole}/>,
      },
    ];
    return (
      <View style={styles.container}>
        <CampusHeader title='Mensa' style={styles.header}
          rightActionItem={rightActionItem}/>
        <TabbedSwipeView count={5} pages={pages}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    elevation: 0, // disable shadow below header to avoid border above pager tabs
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default connect(selectPropsFromStore)(CanteenScreen);
