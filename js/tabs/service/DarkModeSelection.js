import {
  View,
  StyleSheet,
  Text,
  Switch,
  useColorScheme,
} from 'react-native';
import React, { useContext, useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Colors from '../../Styles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import Styles from '../../Styles/StyleSheet';

export default function DarkModeSelection() {
  const colorContext = useContext(ColorSchemeContext);
  const systemTheme = useColorScheme();

  const onClickOverride = (value) => {
    AsyncStorage.setItem(
      'overrideSystemTheme',
      JSON.stringify(value)
    );
    colorContext.setOverride(value);

    if (!value) {
      colorContext.setColorScheme(
        systemTheme === 'dark' ? Colors.darkMode : Colors.lightMode
      );
    } else {
      colorContext.setColorScheme(
        colorContext.darkMode ? Colors.darkMode : Colors.lightMode
      );
    }
  };

  const onToggleDarkMode = (value) => {
    AsyncStorage.setItem('manualDarkMode', JSON.stringify(value));
    colorContext.setDarkMode(value);
    if (value) {
      colorContext.setColorScheme(Colors.darkMode);
    } else {
      colorContext.setColorScheme(Colors.lightMode);
    }
  };

  return (
    <View>
      <View style={Styles.DarkModeSelection.itemRow}>
        <BouncyCheckbox
          fillColor={colorContext.colorScheme.dhbwRed}
          unfillColor={colorContext.colorScheme.card}
          text="Systemeinstellung ignorieren"
          onPress={(value) => onClickOverride(value)}
          isChecked={colorContext.override}
          size={20}
          textStyle={{
            fontSize: 14,
            color: colorContext.colorScheme.text,
            textDecorationLine: 'none',
          }}
        />
      </View>
      {colorContext.override && (
        <View
          style={[
            Styles.DarkModeSelection.itemRow,
            Styles.DarkModeSelection.switchRow,
          ]}
        >
          <Text style={{ color: colorContext.colorScheme.text }}>
            Dark Mode
          </Text>
          <Switch
            trackColor={{
              false: colorContext.colorScheme.dhbwGray,
              true: colorContext.colorScheme.dhbwRed,
            }}
            thumbColor="#f4f3f4"
            onValueChange={(value) => onToggleDarkMode(value)}
            value={colorContext.darkMode}
          />
        </View>
      )}
    </View>
  );
}
