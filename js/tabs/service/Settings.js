import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import NotificationSettings from '../../util/NotificationSettings';
import { enableNotifications } from '../../../env.js';

function HintNotificationsIOS() {
  return (
    <Text style={{ fontStyle: 'italic' }}>
      Die ausgewählten Benachrichtigungen werden Dir nur dann
      angezeigt, wenn Du dies zusätzlich in den iPhone-Einstellungen
      für die Campus App erlaubst!
    </Text>
  );
}

function Notifications() {
  if (!enableNotifications) return null;
  return (
    <View style={styles.configBlock}>
      <Text>
        Hier kannst Du auswählen, welche Benachrichtigungen Du
        erhalten möchtest:
      </Text>
      <NotificationSettings />
      {Platform.OS === 'ios' ? <HintNotificationsIOS /> : null}
    </View>
  );
}

function Category() {
  return (
    <View style={styles.configBlock}>
      <Text>
        Hiermit legst Du fest, für welche Personengruppe Du die
        Mensapreise angezeigt bekommen möchtest:
      </Text>
      <RoleContext.Consumer>
        {({ role, changeRole }) => (
          <RoleSelection role={role} onRoleChange={changeRole} />
        )}
      </RoleContext.Consumer>
    </View>
  );
}

export default function () {
  return (
    <View style={styles.container}>
      <Category />
      <Notifications />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
  },
  configBlock: {
    marginBottom: 20,
  },
});
