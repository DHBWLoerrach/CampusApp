import React from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { dhbwGray, dhbwRed } from './Colors';
import ActivityIndicator from './DHBWActivityIndicator';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../tabs/service/SettingsHelper';

const PushNotification = require('react-native-push-notification');

export default class NotificationSettings extends React.Component {
  state = {
    loading: true,
    notificationsEnabled: true,
    notificationdhbwNews: true,
    notificationdhbwEvents: true,
    notificationschedule: false,
  };

  componentDidMount() {
    this.loadSettings();
  }

  async loadSettings() {
    const settings = await loadNotificationSettings();
    if (settings != null) {
      this.setState({
        notificationsEnabled: settings['notificationsEnabled'],
        notificationdhbwNews: settings['notificationdhbwNews'],
        notificationdhbwEvents: settings['notificationdhbwEvents'],
        notificationschedule: settings['notificationschedule'],
        loading: false,
      });
    } else {
      this.setState({ loading: false });
    }
  }

  async saveSettings() {
    const settingsObject = {
      notificationsEnabled: this.state.notificationsEnabled,
      notificationdhbwNews: this.state.notificationdhbwNews,
      notificationdhbwEvents: this.state.notificationdhbwEvents,
      notificationschedule: this.state.notificationschedule
    };
    saveNotificationSettings(settingsObject);
  }

  changeSettings(change: any) {
    this.setState(change);
    this.saveSettings();
    if (this.state.notificationsEnabled) {
      PushNotification.checkPermissions(({alert}: {alert: boolean}) => {
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
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator />;
    }
    return (
      <View>
        <View style={styles.toggleContainer}>
          <Text style={styles.settingsNotifications}>
            Benachrichtigungen
          </Text>
          <Switch
            trackColor={{ false: dhbwGray, true: dhbwRed }}
            thumbColor={'#f4f3f4'}
            onValueChange={(value) =>
              this.changeSettings({ notificationsEnabled: value })
            }
            value={this.state.notificationsEnabled}
          />
        </View>

        {this.state.notificationsEnabled ? (
          <View>
            <View style={styles.toggleContainer}>
              <Text>DHBW-News</Text>
              <Switch
                trackColor={{ false: dhbwGray, true: dhbwRed }}
                thumbColor={'#f4f3f4'}
                onValueChange={(value) =>
                  this.changeSettings({ notificationdhbwNews: value })
                }
                value={this.state.notificationdhbwNews}
              />
            </View>
            <View style={styles.toggleContainer}>
              <Text>DHBW-Termine</Text>
              <Switch
                trackColor={{ false: dhbwGray, true: dhbwRed }}
                thumbColor={'#f4f3f4'}
                onValueChange={(value) =>
                  this.changeSettings({
                    notificationdhbwEvents: value,
                  })
                }
                value={this.state.notificationdhbwEvents}
              />
            </View>
            {false ? (
              <View style={styles.toggleContainer}>
                <Text>Veränderungen im Vorlesungsplan</Text>
                <Switch
                  trackColor={{ false: dhbwGray, true: dhbwRed }}
                  thumbColor={'#f4f3f4'}
                  onValueChange={(value) =>
                    this.changeSettings({
                      notificationschedule: value,
                    })
                  }
                  value={this.state.notificationschedule}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  settingsNotifications: {
    fontSize: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
