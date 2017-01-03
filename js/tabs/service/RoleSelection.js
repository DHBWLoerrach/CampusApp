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
  constructor(props) {
    super(props);
    this.state = {
      selected: 'student'
    };
  }
  render() {
    return(
      <View>
        <RadioButton selected={this.state.selected === 'student'} label='Student/in' onPress={() => this.setState({selected: 'student'})}/>
        <RadioButton selected={this.state.selected === 'lecturer'} label='Lehrbeauftragte/r' onPress={() => this.setState({selected: 'lecturer'})}/>
        <RadioButton selected={this.state.selected === 'employee'} label='Mitarbeiter/in' onPress={() => this.setState({selected: 'employee'})}/>
        <RadioButton selected={this.state.selected === 'guest'} label='Gast' onPress={() => this.setState({selected: 'guest'})}/>
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
