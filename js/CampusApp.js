import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './WelcomeScreen';
import Navigator from './Navigator';
import ActivityIndicator from './util/DHBWActivityIndicator';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './util/DrawerContent';
import DualisNavigator from './drawer-screens/dualis/DualisNavigator';
import { enableDualis } from './../env.js';
import Styles from './Styles/StyleSheet';
import { ColorSchemeContext } from './context/ColorSchemeContext';
import Colors from './Styles/Colors';

//FontAwesome Library
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faFileLines } from '@fortawesome/free-solid-svg-icons/faFileLines';
import { faFileShield } from '@fortawesome/free-solid-svg-icons/faFileShield';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons/faCloudSun';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot';
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faSchool } from '@fortawesome/free-solid-svg-icons/faSchool';
import { faStreetView } from '@fortawesome/free-solid-svg-icons/faStreetView';
import { faUtensils } from '@fortawesome/free-solid-svg-icons/faUtensils';

library.add(
  faEye,
  faFileLines,
  faFileShield,
  faCircleInfo,
  faGear,
  faEnvelope,
  faCloudSun,
  faBookOpen,
  faPhone,
  faMap,
  faLocationDot,
  faGraduationCap,
  faLink,
  faSchool,
  faStreetView,
  faUtensils
);

export const RoleContext = React.createContext(null);

const Drawer = createDrawerNavigator();

export default function CampusApp() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [didUpgrade, setDidUpgrade] = useState(null);
  const [overrideSystemScheme, setOverrideSystemScheme] =
    useState(false);
  const [manualDarkMode, setManualDarkMode] = useState(false);
  const [colors, setColors] = useState(Colors.lightMode);
  let systemTheme = useColorScheme();

  useEffect(() => {
    const fetchSetupData = async () => {
      const role = await AsyncStorage.getItem('role');
      const upgrade = await AsyncStorage.getItem('didUpgrade');
      setDidUpgrade(upgrade);
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

  const changeRole = (role) => {
    AsyncStorage.setItem('role', role);
    setRole(role);
  };

  // TODO remove didUpgrade flag from AsyncStorage (in fetchSetupData above)
  // and remove this code in next version:
  // WelcomeScreen onSubmit should use changeRole
  // finishSetup method can be removed
  // didUpgrade in else if below
  const finishSetup = (role) => {
    AsyncStorage.setItem('didUpgrade', '2.5');
    setDidUpgrade('2.5');
    changeRole(role);
  };

  let content = <Navigator />;

  if (enableDualis) {
    content = (
      <NavigationContainer independent={true}>
        <Drawer.Navigator
          screenOptions={{ headerShown: false }}
          drawerContent={(props) => <DrawerContent {...props} />}
        >
          <Drawer.Screen name="Home" component={Navigator} />
          <Drawer.Screen name="Dualis" component={DualisNavigator} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  if (loading) {
    content = (
      <View style={Styles.CampusApp.center}>
        <ActivityIndicator />
      </View>
    );
  } else if (!role || !didUpgrade) {
    content = <WelcomeScreen onSubmit={finishSetup} />;
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
