import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Switch } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import { textPersonCategory } from './Texts';
import {dhbwGray, dhbwRed} from "../../util/Colors";
import {loadNotificationSettings, saveNotificationSettings} from "./SettingsHelper";

export default class Settings extends React.Component {

  state = {
    loading: true,
    notificationsEnabled: true,
    notificationdhbwNews: true,
    notificationdhbwEvents: true,
    notificationschedule: false,
  };

  componentDidMount(): void {
    this.loadSettings();
  }

  componentWillUnmount(): void {
    this.saveSettings();
  }

  async loadSettings() {
    console.log("Loading Notification Settings");
    const settings = await loadNotificationSettings();
    if (settings != null) {
      this.setState({
        notificationEnabled: settings['notificationEnabled'],
        notificationdhbwNews: settings['notificationdhbwNews'],
        notificationdhbwEvents: settings['notificationdhbwEvents'],
        notificationschedule: settings['notificationschedule'],
        loading: false
      });
    } else {
      this.setState({loading: false});
    }
  }

  async saveSettings() {
    console.log("Saving Notification Settings");
    const settingsObject = {};
    settingsObject['notificationsEnabled'] = this.state.notificationsEnabled;
    settingsObject['notificationdhbwNews'] = this.state.notificationdhbwNews;
    settingsObject['notificationdhbwEvents'] = this.state.notificationdhbwEvents;
    settingsObject['notificationschedule'] = this.state.notificationschedule;
    saveNotificationSettings(settingsObject);
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator/>
    }
    return (
        <View style={styles.container}>
          <Text style={styles.text}>{textPersonCategory}</Text>
          <RoleContext.Consumer>{
            ({ role, changeRole }) =>  <RoleSelection role={role} onRoleChange={changeRole}/>
          }</RoleContext.Consumer>

          <View style={styles.notifications}>
            <View style={styles.toggleContainer}>
              <Text style={styles.settingsNotifications}>Benachrichtigungen</Text>
              <Switch
                  trackColor={{false: dhbwGray, true: dhbwRed}}
                  thumbColor={"#f4f3f4"}
                  onValueChange={(value) => this.setState({notificationsEnabled: value})}
                  value={this.state.notificationsEnabled}
              />
            </View>

            {this.state.notificationsEnabled ?
                <View style={styles.switches}>
                  <View style={styles.toggleContainer}>
                    <Text>DHBW-News</Text>
                    <Switch
                        trackColor={{false: dhbwGray, true: dhbwRed}}
                        thumbColor={"#f4f3f4"}
                        onValueChange={(value) => this.setState({notificationdhbwNews: value})}
                        value={this.state.notificationdhbwNews}
                    />
                  </View>
                  <View style={styles.toggleContainer}>
                    <Text>DHBW-Termine</Text>
                    <Switch
                        trackColor={{false: dhbwGray, true: dhbwRed}}
                        thumbColor={"#f4f3f4"}
                        onValueChange={(value) => this.setState({notificationdhbwEvents: value})}
                        value={this.state.notificationdhbwEvents}
                    />
                  </View>
                  {false ? <View style={styles.toggleContainer}>
                    <Text>Veränderungen im Vorlesungsplan</Text>
                    <Switch
                        trackColor={{false: dhbwGray, true: dhbwRed}}
                        thumbColor={"#f4f3f4"}
                        onValueChange={(value) => this.setState({notificationschedule: value})}
                        value={this.state.notificationschedule}
                    />
                  </View>: null }
                </View>
                : null}
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  },
  text: {
    marginBottom: 15
  },
  settingsNotifications: {
    fontSize: 18,
  },
  switches:{
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  }
});
