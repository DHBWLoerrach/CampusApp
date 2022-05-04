import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { dhbwGray, dhbwRed } from './Colors';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../tabs/service/SettingsHelper';

export default function ({ enabled = false }) {
  const [notifyNews, setNotifyNews] = useState(enabled);
  const [notifyEvents, setNotifyEvents] = useState(enabled);

  // load settings only once after mount ([] empty dependency list)
  useEffect(() => {
    loadSettings();
  }, []);

  // save settings whenever dependencies [notifyEvents, notifyNews] change
  useEffect(() => {
    const iosRequestPermissions = async () => {
      const settings = await notifee.requestPermission();
      if (
        settings.authorizationStatus < AuthorizationStatus.AUTHORIZED
      ) {
        Alert.alert(
          'Benachrichtigungen einschalten',
          'Bitte erteile der Campus App in den Einstellungen des iPhones die Erlaubnis für den Versand von Benachrichtigungen.'
        );
        setNotifyEvents(false);
        setNotifyNews(false);
      }
    };

    const settingsObject = {
      notificationdhbwNews: notifyNews,
      notificationdhbwEvents: notifyEvents,
    };
    saveNotificationSettings(settingsObject);
    // iOS: check if permission for notifications are granted
    if ((notifyNews || notifyEvents) && Platform.OS === 'ios') {
      iosRequestPermissions();
    }
  }, [notifyEvents, notifyNews]);

  async function loadSettings() {
    const settings = await loadNotificationSettings();
    if (settings !== null) {
      setNotifyNews(settings.notificationdhbwNews);
      setNotifyEvents(settings.notificationdhbwEvents);
    }
  }

  return (
    <View>
      <View style={styles.toggleContainer}>
        <Text>DHBW-News</Text>
        <Switch
          trackColor={{ false: dhbwGray, true: dhbwRed }}
          thumbColor="#f4f3f4"
          onValueChange={(value) => setNotifyNews(value)}
          value={notifyNews}
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text>DHBW-Termine</Text>
        <Switch
          trackColor={{ false: dhbwGray, true: dhbwRed }}
          thumbColor="#f4f3f4"
          onValueChange={(value) => setNotifyEvents(value)}
          value={notifyEvents}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
