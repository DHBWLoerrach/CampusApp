import React, {useContext} from 'react';
import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Styles from '../Styles/StyleSheet';
import {ColorSchemeContext} from "../context/ColorSchemeContext";

const Touchable =
  Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

export default function HeaderIcon({ icon, size, onPress }) {
  return (
    <Touchable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={Styles.HeaderIcon.touchable}
    >
      <View>
        <MaterialIcon
          style={Styles.HeaderIcon.icon}
          name={icon}
          size={size || 24}
          color="white"
        />
      </View>
    </Touchable>
  );
}
