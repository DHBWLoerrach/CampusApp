import React, { useEffect, useRef, useState } from 'react';
import { AppState, StatusBar, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';

import WelcomeScreen from './WelcomeScreen';
import Navigator from './Navigator';
import NotificationTaskScheduler from './util/notifications/NotificationTaskScheduler';
import ActivityIndicator from './util/DHBWActivityIndicator';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

export const RoleContext = React.createContext(null);
NotificationTaskScheduler();

const Drawer = createDrawerNavigator();

export default function CampusApp() {
  const appState = useRef(AppState.currentState);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [didUpgrade, setDidUpgrade] = useState(null);

  useEffect(() => {
    const fetchSetupData = async () => {
      const role = await AsyncStorage.getItem('role');
      const upgrade = await AsyncStorage.getItem('didUpgrade');
      setDidUpgrade(upgrade);
      setRole(role);
      setLoading(false);
    };
    fetchSetupData();
  }, []);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  // Remove all push notifications when app becomes active
  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      PushNotification.removeAllDeliveredNotifications();
    }
    appState.current = nextAppState;
  };

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

  let content = <NavigationContainer independent={true}>
                  <Drawer.Navigator>
                    <Drawer.Screen name="DHBW Campus" component={Navigator} /> 
                  </Drawer.Navigator> 
                </NavigationContainer>;

  if (loading) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  } else if (!role || !didUpgrade) {
    content = <WelcomeScreen onSubmit={finishSetup} />;
  }

  return (
    <RoleContext.Provider value={{ role, changeRole }}>
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          barStyle="light-content"
        />
        {content}
      </View>
    </RoleContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
