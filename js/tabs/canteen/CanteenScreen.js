import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import isToday from 'date-fns/isToday';

import { RoleContext } from '../../CampusApp';
import Styles from '../../util/Styles';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import HeaderIcon from '../../util/HeaderIcon';
import ReloadView from '../../util/ReloadView';

import {
  fetchCanteenDataFromWeb,
  loadCanteenDataFromStore,
  saveCanteenDataToStore,
} from './store';
import CanteenDayListView from './CanteenDayListView';

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

const Tab = createMaterialTopTabNavigator();

function getDateObject(date) {
  const dateParts = date.split('.').reverse();
  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
}

function DayPage({ menus }) {
  return (
    <RoleContext.Consumer>
      {({ role }) => <CanteenDayListView meals={menus} role={role} />}
    </RoleContext.Consumer>
  );
}

function getPages(dayPlans) {
  return dayPlans.slice(0, 5).map((dayPlan, _) => {
    const date = getDateObject(dayPlan.date);
    const title = format(date, 'EE dd.MM.', { locale: de });
    const dayPage = <DayPage menus={dayPlan.menus} />;
    return <Tab.Screen name={title} component={dayPage} />;
  });
}

function CanteenScreen() {
  const [isLoading, setLoading] = useState(true);
  const [hasNetworkError, setNetworkError] = useState(false);
  const [dayPlans, setDayPlans] = useState(null);

  // load fresh data from web and store it locally
  async function refresh() {
    setLoading(true);
    setNetworkError(false);
    const data = await fetchCanteenDataFromWeb();
    if (data === 'networkError') {
      setNetworkError(true);
    } else {
      saveCanteenDataToStore(data);
      setDayPlans(data);
    }
    setLoading(false);
  }

  // load data from local store or from web if store is emtpy
  async function loadData() {
    let data = await loadCanteenDataFromStore();
    if (data !== null) {
      setDayPlans(data);
      setLoading(false);
    } else refresh();
  }

  // load data when this component is mounted
  useEffect(() => {
    if (dayPlans === null) loadData();
  }, []);

  // when screen is focussed, load new data if empty or if today > dayPlans.first
  useFocusEffect(
    useCallback(() => {
      if (!dayPlans || !isToday(getDateObject(dayPlans[0].date))) {
        refresh();
      }
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const buttonText = 'Speiseplan laden';
  if (!dayPlans || dayPlans.length === 0) {
    let infoText =
      'Zur Zeit gibt es für die Mensa keinen Speiseplan.';
    if (hasNetworkError) infoText = null; // text set in ReloadView
    return (
      <ReloadView
        buttonText={buttonText}
        message={infoText}
        onPress={refresh}
      />
    );
  }

  return (
    <Tab.Navigator tabBarOptions={Styles.topTabBar}>
      {getPages(dayPlans)}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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

CanteenScreen.navigationOptions = () => ({
  headerRight: () => (
    <HeaderIcon
      onPress={() => {
        let textBody = textCanteenInfo;
        if (Platform.OS === 'android') textBody += textNfcInfo;
        return Alert.alert('Mensa Hangstraße 46-50', textBody);
      }}
      icon="help-outline"
    />
  ),
});

export default CanteenScreen;
