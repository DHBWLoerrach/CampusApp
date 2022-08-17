import React, {useContext} from 'react';
import { Platform, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import NotificationSettings from '../../util/NotificationSettings';
import Styles from '../../Styles/StyleSheet';
import DarkModeSelection from "./DarkModeSelection";
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

function HintNotificationsIOS() {
    const colorContext = useContext(ColorSchemeContext);
  return (
    <Text style={{ fontStyle: 'italic', color: colorContext.colorScheme.text }}>
      Die ausgewählten Benachrichtigungen werden Dir nur dann
      angezeigt, wenn Du dies zusätzlich in den iPhone-Einstellungen
      für die Campus App erlaubst!
    </Text>
  );
}

function Notifications() {
    const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={Styles.Settings.configBlock}>
      <Text style={{color: colorContext.colorScheme.text}}>
        Hier kannst Du auswählen, welche Benachrichtigungen Du
        erhalten möchtest:
      </Text>
      <NotificationSettings />
      {Platform.OS === 'ios' ? <HintNotificationsIOS /> : null}
    </View>
  );
}

function Category() {
    const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={Styles.Settings.configBlock}>
      <Text style={{color: colorContext.colorScheme.text}}>
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
    const colorContext = useContext(ColorSchemeContext);
    return (
        <View style={Styles.Settings.configBlock}>
            <Text style={{color: colorContext.colorScheme.text}}>
                Hier kannst du manuell den Dark Mode der App aktivieren.
                Dafür muss die Verwendung der Systemeinstellung deaktiviert werden.
            </Text>
            <DarkModeSelection/>
        </View>
    );
}

export default function () {
    const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={[Styles.Settings.container, {backgroundColor: colorContext.colorScheme.background}]}>
      <Category />
      <Notifications />
        <DarkMode/>
    </View>
  );
}
