import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import { textPersonCategory } from './Texts';
import NotificationSettings from '../../util/NotificationSettings';

export default function () {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{textPersonCategory}</Text>
      <RoleContext.Consumer>
        {({ role, changeRole }) => (
          <RoleSelection role={role} onRoleChange={changeRole} />
        )}
      </RoleContext.Consumer>
      <NotificationSettings />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
  },
});
