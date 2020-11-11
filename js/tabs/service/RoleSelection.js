import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import { roles } from '../../util/Constants';

const RadioButtonTouchable =
  Platform.OS === 'android'
    ? TouchableNativeFeedback
    : TouchableOpacity;

function RadioButton(props) {
  return (
    <RadioButtonTouchable onPress={props.onPress}>
      <View style={styles.radioButton}>
        <View style={styles.outerCircle}>
          {props.selected ? (
            <View style={styles.innerCircle} />
          ) : null}
        </View>
        <Text
          style={[styles.label, props.selected ? styles.bold : null]}
        >
          {props.label}
        </Text>
      </View>
    </RadioButtonTouchable>
  );
}

export default function RoleSelection(props) {
  return (
    <View style={styles.radioGroup}>
      {roles.map((role, index) => (
        <RadioButton
          key={index}
          selected={props.role === role}
          label={role}
          onPress={() => props.onRoleChange(role)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  radioGroup: {
    marginTop: 10,
  },
  radioButton: {
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
  },
});
