import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { dhbwRed } from '../Styles/Colors';

export default function Checkbox({
  isChecked,
  onPress,
  color,
  backgroundColor,
  label,
}) {
  const [checked, setChecked] = useState(isChecked);
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        setChecked(!checked);
        onPress(!checked);
      }}
    >
      <View style={styles.checkboxContainer}>
        <View
          style={[
            styles.checkboxBase,
            { borderColor: checked ? dhbwRed : color },
          ]}
        >
          {checked && (
            <FontAwesome6
              name="check"
              size={14}
              style={{ color, backgroundColor }}
            />
          )}
        </View>
        <Text style={[styles.checkboxLabel, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBase: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
  },
  checkboxLabel: {
    marginLeft: 5,
  },
});
