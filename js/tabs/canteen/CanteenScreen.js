// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import deLocale from 'date-fns/locale/de';
import format from 'date-fns/format';
import isSaturday from 'date-fns/is_saturday'
import isSunday from 'date-fns/is_sunday'

import CampusHeader from '../../util/CampusHeader';
import ReloadView from '../../util/ReloadView';
import TabbedSwipeView from '../../util/TabbedSwipeView';

import CanteenDayListView from './CanteenDayListView';
import { fetchDayPlans } from './redux';

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
    dayPlans: store.canteen.dayPlans,
    isFetching: store.canteen.isFetching,
    networkError: store.canteen.networkError,
  };
}

class CanteenScreen extends Component {
  _onPress() {
    let textBody = textCanteenInfo;
    if(Platform.OS === 'android') textBody += textNfcInfo;
    return Alert.alert('Mensa Hangstraße 46-50', textBody);
  }

  componentWillMount() {
    this.props.dispatch(fetchDayPlans());
  }

  _getPages() {
    return (
      this.props.dayPlans.slice(0,5).map(
        (dayPlan,index) => {
          const dateParts = dayPlan.date.split('.').reverse();
          const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          return {
            title: format(date, 'dd DD.MM.', { locale: deLocale }),
            content: <CanteenDayListView meals={dayPlan.menus} role={this.props.selectedRole}/>,
          };
        }
      )
    );
  }

  _renderScreenContent() {
    const { dayPlans, isFetching, networkError } = this.props;

    if(isFetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    const buttonText = 'Speiseplan laden';
    if(dayPlans.length === 0) {
      if(networkError) {
        return (
          <ReloadView buttonText={buttonText}
            onPress={() => this.props.dispatch(fetchDayPlans())}/>
        );
      }
      else {
        const infoText = 'Zur Zeit gibt es für die Mensa keinen Speiseplan.';
        return (
          <ReloadView buttonText={buttonText} message={infoText}
            onPress={() => this.props.dispatch(fetchDayPlans())}/>
        );
      }
    }

    return <TabbedSwipeView count={dayPlans.length} pages={this._getPages()}/>;
  }

  render() {
    const rightActionItem = {
      title: 'Info',
      icon: require('./img/question.png'),
      onPress: this._onPress,
      show: 'always', // needed for Android
    };

    return (
      <View style={styles.container}>
        <CampusHeader title='Mensa' style={styles.header}
          rightActionItem={rightActionItem}/>
          {this._renderScreenContent()}
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
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(selectPropsFromStore)(CanteenScreen);
