import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../tabs/service/SettingsHelper';
import { ColorSchemeContext } from '../context/ColorSchemeContext';

export default function ({ enabled = false, onFirstLaunch = false }) {
  const [notifyNews, setNotifyNews] = useState(enabled);
  const [notifyEvents, setNotifyEvents] = useState(enabled);

  // load settings only once after mount ([] empty dependency list)
  useEffect(() => {
    loadSettings();
    if ((notifyEvents || notifyNews) && Platform.OS === 'ios') {
      iosCheckPermissions();
    }
  }, []);

  // save settings whenever dependencies [notifyEvents, notifyNews] change
  useEffect(() => {
    const settingsObject = {
      notificationdhbwNews: notifyNews,
      notificationdhbwEvents: notifyEvents,
    };
    saveNotificationSettings(settingsObject);
  }, [notifyEvents, notifyNews]);

  const colorContext = useContext(ColorSchemeContext);

  async function loadSettings() {
    const settings = await loadNotificationSettings();
    if (settings !== null) {
      setNotifyNews(settings.notificationdhbwNews);
      setNotifyEvents(settings.notificationdhbwEvents);
    }
  }

  async function iosRequestPermissions() {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED
    );
  }

  async function iosCheckPermissions() {
    const allowed = await iosRequestPermissions();
    // if user disabled notifications for Campus App in the meantime
    // we disable them in the settings as well
    if (!allowed) {
      setNotifyNews(false);
      setNotifyEvents(false);
    }
  }

  async function iosRequestPermissionWithAlert() {
    const allowed = await iosRequestPermissions();
    if (!allowed) {
      Alert.alert(
        'Benachrichtigungen einschalten',
        'Bitte erteile der Campus App in den Einstellungen des iPhones die Erlaubnis für den Versand von Benachrichtigungen.'
      );
    }
    return allowed;
  }

  async function toggleNotifyNews(value) {
    // iOS: check if permission for notifications are granted
    if (value && Platform.OS === 'ios') {
      const allowed = await iosRequestPermissionWithAlert();
      if (!allowed) return;
    }
    setNotifyNews(value);
  }

  async function toggleNotifyEvents(value) {
    // iOS: check if permission for notifications are granted
    if (value && Platform.OS === 'ios') {
      const allowed = await iosRequestPermissionWithAlert();
      if (!allowed) return;
    }
    setNotifyEvents(value);
  }

  return (
    <View>
      <View style={styles.toggleContainer}>
        <Text style={{ color: colorContext.colorScheme.text }}>
          DHBW-News
        </Text>
        <Switch
          trackColor={{
            false: colorContext.colorScheme.dhbwGray,
            true: colorContext.colorScheme.dhbwRed,
          }}
          thumbColor="#f4f3f4"
          onValueChange={(value) => toggleNotifyNews(value)}
          value={notifyNews}
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={{ color: colorContext.colorScheme.text }}>
          DHBW-Termine
        </Text>
        <Switch
          trackColor={{
            false: colorContext.colorScheme.dhbwGray,
            true: colorContext.colorScheme.dhbwRed,
          }}
          thumbColor="#f4f3f4"
          onValueChange={(value) => toggleNotifyEvents(value)}
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
