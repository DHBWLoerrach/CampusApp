import React, { useContext } from 'react';
import { Text, View, ScrollView } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import Styles from '../../Styles/StyleSheet';
import DarkModeSelection from './DarkModeSelection';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

function Category() {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={Styles.Settings.configBlock}>
      <Text style={{ color: colorContext.colorScheme.text }}>
        Hiermit legst du fest, für welche Personengruppe du die
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
      <Text style={{ color: colorContext.colorScheme.text }}>
        Hier kannst du manuell den Dark Mode der App aktivieren. Dafür
        muss die Verwendung der Systemeinstellung deaktiviert werden.
      </Text>
      <DarkModeSelection />
    </View>
  );
}

export default function () {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <ScrollView
      style={[
        Styles.Settings.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <Category />
      <DarkMode />
    </ScrollView>
  );
}
