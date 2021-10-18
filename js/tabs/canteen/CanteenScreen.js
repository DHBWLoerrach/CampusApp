import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import isToday from 'date-fns/isToday';

import { RoleContext } from '../../CampusApp';
import Styles from '../../util/Styles';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import ReloadView from '../../util/ReloadView';

import {
  fetchCanteenDataFromWeb,
  loadCanteenDataFromStore,
  saveCanteenDataToStore,
} from './store';
import CanteenDayListView from './CanteenDayListView';

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
  return dayPlans.slice(0, 5).map((dayPlan, index) => {
    const date = getDateObject(dayPlan.date);
    const title = format(date, 'EE dd.MM.', { locale: de });
    return (
      <Tab.Screen key={index} name={title}>
        {() => <DayPage menus={dayPlan.menus} />}
      </Tab.Screen>
    );
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
    if (
      !data ||
      data.length === 0 ||
      !isToday(getDateObject(data[0].date))
    ) {
      refresh();
    } else {
      setDayPlans(data);
      setLoading(false);
    }
  }

  // when screen is focussed, load data resp. refresh if empty or today > dayPlans.first
  useFocusEffect(
    useCallback(() => {
      loadData();
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
    <Tab.Navigator screenOptions={Styles.topTabBar}>
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

export default CanteenScreen;
