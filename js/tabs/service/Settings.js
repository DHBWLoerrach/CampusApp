import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import { textPersonCategory } from './Texts';

export default function Settings(props) {
  const { role, changeRole } = useContext(RoleContext);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{textPersonCategory}</Text>
      <RoleSelection role={role} onRoleChange={changeRole} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  },
  text: {
    marginBottom: 15
  }
});
