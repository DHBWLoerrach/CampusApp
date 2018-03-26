// @flow
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { connect } from 'react-redux';

import { selectRole } from './redux';

import RoleSelection from './RoleSelection';
import { textSettings } from './Texts';

function selectPropsFromStore(store) {
  return {
    selectedRole: store.settings.selectedRole
  };
}

class Settings extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textSettings}</Text>
        <RoleSelection
          role={this.props.selectedRole}
          onRoleChange={role => this.props.dispatch(selectRole(role))}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  }
});

export default connect(selectPropsFromStore)(Settings);
