import React from 'react';
import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const Touchable =
  Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

export default function HeaderIcon({ icon, size, onPress }) {
  return (
    <Touchable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.touchable}
    >
      <View>
        <MaterialIcon
          style={styles.icon}
          name={icon}
          size={size || 24}
          color="white"
        />
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 10,
  },
});
