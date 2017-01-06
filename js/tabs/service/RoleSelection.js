// @flow
'use strict';

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import { roles } from '../../util/Constants';

const RadioButtonTouchable = Platform.OS === 'android'
  ? TouchableNativeFeedback
  : TouchableOpacity;

class RadioButton extends Component {
  render() {
    return (
      <RadioButtonTouchable onPress={this.props.onPress}>
        <View style={styles.radioButton}>
          <View style={styles.outerCircle}>
            {this.props.selected ? <View style={styles.innerCircle}/> : null}
          </View>
          <Text style={[styles.label, this.props.selected ? styles.bold : null]}>
            {this.props.label}
          </Text>
        </View>
      </RadioButtonTouchable>
    );
  }
}

export default class RoleSelection extends Component {
  render() { // TODO: flow type for roles
    return(
      <View>
        <RadioButton
          selected={this.props.role === roles[0]}
          label={roles[0]}
          onPress={() => this.props.onRoleChange(roles[0])}/>
        <RadioButton
          selected={this.props.role === roles[1]}
          label={roles[1]}
          onPress={() => this.props.onRoleChange(roles[1])}/>
        <RadioButton
          selected={this.props.role === roles[2]}
          label={roles[2]}
          onPress={() => this.props.onRoleChange(roles[2])}/>
        <RadioButton
          selected={this.props.role === roles[3]}
          label={roles[3]}
          onPress={() => this.props.onRoleChange(roles[3])}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 5,
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'black',
  },
  label: {
    marginLeft: 5,
  },
  bold: {
    fontWeight: 'bold',
  }
});
