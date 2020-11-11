import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { dhbwGray, dhbwRed } from './Colors';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../tabs/service/SettingsHelper';

const PushNotification = require('react-native-push-notification');

export default function () {
  const [notifyNews, setNotifyNews] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);

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
    if (notifyNews || notifyEvents) {
      PushNotification.checkPermissions(
        ({ alert }: { alert: boolean }) => {
          if (!alert) {
            if (Platform.OS === 'ios') {
              //Request for permissions on ios
              PushNotification.requestPermissions();
            } else {
              Alert.alert(
                'Benachrichtigungen einschalten',
                'Du musst in den Einstellungen den Versand von Benachrichtigungen erlauben.'
              );
            }
          }
        }
      );
    }
  }, [notifyEvents, notifyNews]);

  async function loadSettings() {
    const settings = await loadNotificationSettings();
    if (settings != null) {
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
