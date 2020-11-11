import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import NotificationSettings from '../../util/NotificationSettings';
import { enableNotifications } from '../../../env.js';

function Notifications() {
  if (!enableNotifications) return null;
  return (
    <View style={styles.configBlock}>
      <Text>
        Hier kannst Du auswählen, welche Benachrichtigungen Du
        erhalten möchtest:
      </Text>
      <NotificationSettings />
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
