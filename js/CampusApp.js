import { createContext, useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './WelcomeScreen';
import Navigator from './Navigator';
import ActivityIndicator from './util/DHBWActivityIndicator';
import Styles from './Styles/StyleSheet';
import { ColorSchemeContext } from './context/ColorSchemeContext';
import Colors from './Styles/Colors';

export const RoleContext = createContext(null);

export default function CampusApp() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrideSystemScheme, setOverrideSystemScheme] =
    useState(false);
  const [manualDarkMode, setManualDarkMode] = useState(false);
  const [colors, setColors] = useState(Colors.lightMode);
  let systemTheme = useColorScheme();

  useEffect(() => {
    const fetchSetupData = async () => {
      const role = await AsyncStorage.getItem('role');
      setRole(role);

      const override = await AsyncStorage.getItem(
        'overrideSystemTheme'
      );
      const manualSetting = await AsyncStorage.getItem(
        'manualDarkMode'
      );
      setOverrideSystemScheme(override === 'true' ? true : false);
      if (override !== null) {
        setManualDarkMode(manualSetting === 'true' ? true : false);
      }

      if (override === 'true') {
        setColors(
          manualSetting === 'true'
            ? Colors.darkMode
            : Colors.lightMode
        );
      } else {
        setColors(
          systemTheme === 'dark' ? Colors.darkMode : Colors.lightMode
        );
      }
      setLoading(false);
    };
    fetchSetupData();
  }, []);

  useEffect(() => {
    if (!overrideSystemScheme) {
      setColors(
        systemTheme === 'light' ? Colors.lightMode : Colors.darkMode
      );
    }
  }, [systemTheme]);

  const changeRole = async (role) => {
    await AsyncStorage.setItem('role', role);
    setRole(role);
  };

  let content = <Navigator />;

  if (loading) {
    content = (
      <View style={Styles.CampusApp.center}>
        <ActivityIndicator />
      </View>
    );
  } else if (!role) {
    content = <WelcomeScreen onSubmit={changeRole} />;
  }

  return (
    <RoleContext.Provider value={{ role, changeRole }}>
      <ColorSchemeContext.Provider
        value={{
          override: overrideSystemScheme,
          setOverride: setOverrideSystemScheme,
          darkMode: manualDarkMode,
          setDarkMode: setManualDarkMode,
          colorScheme: colors,
          setColorScheme: setColors,
        }}
      >
        <View
          style={[
            Styles.CampusApp.container,
            { backgroundColor: colors.background },
          ]}
        >
          <StatusBar
            translucent={true}
            backgroundColor="rgba(0, 0, 0, 0.2)"
            barStyle="light-content"
          />
          {content}
        </View>
      </ColorSchemeContext.Provider>
    </RoleContext.Provider>
  );
}
