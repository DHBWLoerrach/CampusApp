import React from 'react';
import {
  Platform,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import { roles } from '../../util/Constants';
import Styles from '../../Styles/StyleSheet';

const RadioButtonTouchable =
  Platform.OS === 'android'
    ? TouchableNativeFeedback
    : TouchableOpacity;

function RadioButton(props) {
  return (
    <RadioButtonTouchable onPress={props.onPress}>
      <View style={Styles.RoleSelection.radioButton}>
        <View style={Styles.RoleSelection.outerCircle}>
          {props.selected ? (
            <View style={Styles.RoleSelection.innerCircle} />
          ) : null}
        </View>
        <Text
          style={[Styles.RoleSelection.label, props.selected ? Styles.RoleSelection.bold : null]}
        >
          {props.label}
        </Text>
      </View>
    </RadioButtonTouchable>
  );
}

export default function RoleSelection(props) {
  return (
    <View style={Styles.RoleSelection.radioGroup}>
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