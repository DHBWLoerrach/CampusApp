import React, { useEffect, useState } from 'react';
import {
  AppState,
  Platform,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';
import NfcManager, { NfcTech, NfcEvents } from 'react-native-nfc-manager'
import Snackbar from 'react-native-snackbar';

import WelcomeScreen from './WelcomeScreen';
import Navigator from './Navigator';
import NotificationTaskScheduler from './util/notifications/NotificationTaskScheduler';
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
NotificationTaskScheduler();

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
    // iOS: Remove all push notifications when app becomes active
    const _handleAppStateChangeiOS = (nextAppState) => {
      if (nextAppState === 'active') {
        notifee.cancelAllNotifications();
        notifee.setBadgeCount(0);
      }
    };

    // Android: Remove all push notifications when app is focussed
    // no need to check appState as there's a dedicated event for this on Android
    const _handleAppStateChangeAndroid = () => {
      notifee.cancelAllNotifications();
      notifee.setBadgeCount(0);
    };

    const handler =
      Platform.OS === 'android'
        ? _handleAppStateChangeAndroid
        : _handleAppStateChangeiOS;
    const event = Platform.OS === 'android' ? 'focus' : 'change';

    const eventSubscription = AppState.addEventListener(
      event,
      handler
    );

    return () => {
      eventSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!overrideSystemScheme) {
      setColors(
        systemTheme === 'light' ? Colors.lightMode : Colors.darkMode
      );
    }
  }, [systemTheme]);

  useEffect(() => {
    async function startNFCManager() {
      // start the NFC manager and check if NFC is available on the device 
      const isNfcAvailable = await NfcManager.isSupported();
      if (isNfcAvailable) {
        // NFC is available
        await NfcManager.start();
        // Register the StateChanged listener
        const handleNfcStateChanged = async ({ state }) => {
          if (state === 'off') {
            NfcManager.cancelTechnologyRequest().catch(() => 0);
          }
        };

        NfcManager.setEventListener(NfcEvents.StateChanged, handleNfcStateChanged);

        // Call the readIsoDep function to read the NFC tag in an infinite loop 
        while (true) {
          await readIsoDep();
        }
      }
    }

    startNFCManager();

    async function readIsoDep() {
      try {
        await NfcManager.requestTechnology(NfcTech.IsoDep, {
          alertMessage: 'Halte nun Deinen DHBW-Ausweis an die Rückseite Deines Handys',
        });

        const isoDep = NfcManager.isoDepHandler;
        // note: documentation for the InterCard (i.e. Mifare Desfire) is hard to find :-(
        // inspect raw NFC data an NFC app, search PlayStore for "nfc info" or "nfc reader"
        // see https://ridrix.wordpress.com/2009/09/20/tkort-public-transportation-card-explorations/
        // see https://ridrix.wordpress.com/2009/09/19/mifare-desfire-communication-example/
        // these NFC tags are based on ISO 14443-4

        // A tag contains applications which consist of files. Value files have settings and a value.
        // The following code access a specific app and gets contents and settings from a value file.

        // command byte arrays are sent to tag, first element is command, following are 'parameters'
        // send command 0x5a to select application with ID 0x15845F
        // if android then use transceive else use sendCommandAPDU
        let balanceBytes;
        let lastTransactionBytes;
        if (Platform.OS === 'android') {
          // now we can access data and files on the level of the selected application
          await isoDep.transceive([0x5a, 0x5f, 0x84, 0x15]);
          // command to get value of value file: 0x6c, file 1 is requested (which is a value file)
          // the contents of this value file contains the current balance in 4 bytes
          balanceBytes = await isoDep.transceive([0x6c, 0x1]);
          // command to get file settings: 0xf5, file 1 is requested (which is a value file)
          lastTransactionBytes = await isoDep.transceive([0xf5, 0x1]);
        } else {
          // now we can access data and files on the level of the selected application
          await isoDep.sendCommandAPDU({
            cla: 0x00,
            ins: 0xA4,
            p1: 0x04,
            p2: 0x00,
            data: [0x5F, 0x84, 0x15],
            le: 0x00
          });
          // command to get value of value file: 0x6c, file 1 is requested (which is a value file)
          // the contents of this value file contains the current balance in 4 bytes
          balanceBytes = await isoDep.sendCommandAPDU({
            cla: 0x00,
            ins: 0x6C,
            p1: 0x00,
            p2: 0x01,
            data: [],
            le: 0x00,
          });
          // command to get file settings: 0xf5, file 1 is requested (which is a value file)
          lastTransactionBytes = await isoDep.transceive({
            cla: 0xF5,
            ins: 0x01,
            p1: 0x00,
            p2: 0x00,
            data: [],
            le: 0x00
          });
        }

        function convertFourHexBytesToInt(b1, b2, b3, b4) {
          let hexString = b1.toString(16).padStart(2, '0') +
            b2.toString(16).padStart(2, '0') +
            b3.toString(16).padStart(2, '0') +
            b4.toString(16).padStart(2, '0');

          return parseInt(hexString, 16);
        }
        // convert relevant bytes to int in proper order (reverse)
        let balance = convertFourHexBytesToInt(balanceBytes[4], balanceBytes[3], balanceBytes[2], balanceBytes[1]);
        balance /= 10; // for some reason the tag contains the amount in euro cent * 10

        // File settings consist of 18 bytes. Bytes 13 - 17 correspond to a "limited credit value"
        // which seems to contain the amount for the last transaction
        // convert relevant bytes to int in proper order (reverse)
        let lastTransaction = convertFourHexBytesToInt(lastTransactionBytes[16], lastTransactionBytes[15],
          lastTransactionBytes[14], lastTransactionBytes[13]);
        lastTransaction /= 10; // for some reason the tag contains the amount in euro cent * 10
        //show the balance and the last transaction in a snackbar
        Snackbar.show({
          text: `Guthaben: ${balance / 100.0}€\nLetzte Transaktion: ${-lastTransaction / 100.0}€`,
          duration: Snackbar.LENGTH_LONG,
        });

      } catch (ex) {
        // error handling
        console.warn('error reading nfc tag: ', ex);
      } finally {
        await NfcManager.cancelTechnologyRequest().catch(() => 0); // cancel NFC request
      }
    }

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
      NfcManager.setEventListener(NfcEvents.StateChanged, null);
    }
  }, []);

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
