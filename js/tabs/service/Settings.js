import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { connect } from 'react-redux';

import { selectRole } from './redux';

import RoleSelection from './RoleSelection';
import { textPersonCategory } from './Texts';

function selectPropsFromStore(store) {
  return {
    selectedRole: store.settings.selectedRole
  };
}

function Settings(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{textPersonCategory}</Text>
      <RoleSelection
        role={props.selectedRole}
        onRoleChange={role => props.dispatch(selectRole(role))}
      />
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

export default connect(selectPropsFromStore)(Settings);
