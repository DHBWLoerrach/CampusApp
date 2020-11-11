import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import { dhbwGray, dhbwRed } from './Colors';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../tabs/service/SettingsHelper';

export default function () {
  const [notifyNews, setNotifyNews] = useState(false);
  const [notifyEvents, setNotifyEvents] = useState(false);

  // load settings only once after mount ([] empty dependency list)
  useEffect(() => {
    loadSettings();
  }, []);

  // save settings whenever dependencies [notifyEvents, notifyNews] change
  useEffect(() => {
    const settingsObject = {
      notificationdhbwNews: notifyNews,
      notificationdhbwEvents: notifyEvents,
    };
    saveNotificationSettings(settingsObject);
    // iOS: check if permission for notifications are granted
    if ((notifyNews || notifyEvents) && Platform.OS === 'ios') {
      PushNotification.checkPermissions(
        ({
          alert,
          badge,
          sound,
        }: {
          alert: boolean;
          badge: boolean;
          sound: boolean;
        }) => {
          if (!alert && !badge && !sound) {
            Alert.alert(
              'Benachrichtigungen einschalten',
              'Bitte erteile der Campus App in den Einstellungen des iPhones die Erlaubnis für den Versand von Benachrichtigungen.'
            );
            setNotifyEvents(false);
            setNotifyNews(false);
          }
        }
      );
    }
  }, [notifyEvents, notifyNews]);

  async function loadSettings() {
    const settings = await loadNotificationSettings();
    console.log(settings);
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
