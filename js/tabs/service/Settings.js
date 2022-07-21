import React from 'react';
import { Platform, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import NotificationSettings from '../../util/NotificationSettings';
import Styles from '../../Styles/StyleSheet';
import DarkModeSelection from "./DarkModeSelection";

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
  return (
    <View style={Styles.Settings.configBlock}>
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
    <View style={Styles.Settings.configBlock}>
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

function DarkMode() {
    return (
        <View style={Styles.Settings.configBlock}>
            <Text>
                Hier kannst du manuell den Dark Mode der App aktivieren.
                Dafür muss die Verwendung der Systemeinstellung deaktiviert werden.
            </Text>
            <DarkModeSelection/>
        </View>
    );
}

export default function () {
  return (
    <View style={Styles.Settings.container}>
      <Category />
      <Notifications />
        <DarkMode/>
    </View>
  );
}
