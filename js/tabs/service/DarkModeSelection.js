import { View, Text, Switch, useColorScheme } from 'react-native';
import { useContext } from 'react';
import Colors from '../../Styles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import Checkbox from '../../ui/Checkbox';
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
    colorContext.setColorScheme(
      value ? Colors.darkMode : Colors.lightMode
    );
  };

  return (
    <View>
      <View style={Styles.DarkModeSelection.itemRow}>
        <Checkbox
          isChecked={colorContext.override}
          onPress={(value) => onClickOverride(value)}
          color={colorContext.colorScheme.text}
          backgroundColor={colorContext.colorScheme.background}
          label="Systemeinstellung ignorieren"
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
