import React, {useContext} from 'react';
import {
  Platform,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import { roles } from '../../util/Constants';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

const RadioButtonTouchable =
  Platform.OS === 'android'
    ? TouchableNativeFeedback
    : TouchableOpacity;

function RadioButton(props) {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <RadioButtonTouchable onPress={props.onPress}>
      <View style={Styles.RoleSelection.radioButton}>
        <View style={[Styles.RoleSelection.outerCircle, {borderColor: colorContext.colorScheme.icon}]}>
          {props.selected ? (
            <View style={[Styles.RoleSelection.innerCircle, {backgroundColor: colorContext.colorScheme.icon}]} />
          ) : null}
        </View>
        <Text
          style={[Styles.RoleSelection.label, {color: colorContext.colorScheme.text}, props.selected ? Styles.RoleSelection.bold : null]}
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