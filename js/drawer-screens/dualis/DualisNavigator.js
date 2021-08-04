import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import jwt_decode from 'jwt-decode';
import Colors from '../../util/Colors';
import DualisIntro from './DualisIntro';
import DualisLogin from './DualisLogin';
import DualisMain from './DualisMain';
import DualisDetail from './DualisDetail';
import DualisStatistics from './DualisStatistics';

export default function DualisNavigator({ navigation }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [intro, setIntro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    focusListener = navigation.addListener('focus', () =>
      isAuthenticated()
    );
  }, []);

  async function isAuthenticated() {
    setLoading(true);
    const token = await AsyncStorage.getItem('dualisToken');

    if (token == null) {
      setAuthenticated(false);
      setIntro(true);
      setLoading(false);
      return;
    }

    let tokenDecoded;
    try {
      tokenDecoded = jwt_decode(token);
      if (Date.now() >= tokenDecoded.standardclaims.exp * 1000) {
        setAuthenticated(false);
        setIntro(false);
        setLoading(false);
        return;
      }
    } catch (err) {
      setAuthenticated(false);
      setIntro(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    setIntro(true);
    setLoading(false);
  }

  const stackHeaderConfig = {
    headerBackTitle: 'Zurück',
    headerTintColor: 'white',
    headerLeft: () => (
      <MaterialIcon
        style={styles.icon}
        onPress={() => {
          navigation.toggleDrawer();
        }}
        name="menu"
        size={30}
      />
    ),
    headerStyle: {
      backgroundColor: Colors.dhbwRed,
      shadowColor: 'transparent', // prevent line below header in iOS
      ...Platform.select({
        android: {
          elevation: 0,
        },
      }),
    },
  };

  const Stack = createStackNavigator();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer independent={true}>
      {authenticated ? (
        <Stack.Navigator
          initialRouteName="DualisMain"
          screenOptions={stackHeaderConfig}
        >
          <Stack.Screen
            name="DualisMain"
            component={DualisMain}
            options={{ headerTitle: 'Dualis' }}
          />
          <Stack.Screen
            name="DualisDetail"
            component={DualisDetail}
            options={{ title: 'Dualis Vorlesungsdetails' }}
          />
          <Stack.Screen
            name="DualisStatistics"
            component={DualisStatistics}
            options={{ title: 'Dualis Modulstatistik' }}
          />
          <Stack.Screen
            name="DualisLogin"
            component={DualisLogin}
            options={{ title: 'Dualis Login' }}
          />
        </Stack.Navigator>
      ) : intro ? (
        <Stack.Navigator
          initialRouteName="DualisIntro"
          screenOptions={stackHeaderConfig}
        >
          <Stack.Screen
            name="DualisIntro"
            component={DualisIntro}
            options={{ title: 'Campus App Dualis' }}
          />
          <Stack.Screen
            name="DualisLogin"
            component={DualisLogin}
            options={{ title: 'Dualis Login' }}
          />
          <Stack.Screen
            name="DualisMain"
            component={DualisMain}
            options={{ headerTitle: 'Dualis' }}
          />
          <Stack.Screen
            name="DualisDetail"
            component={DualisDetail}
            options={{ title: 'Dualis Vorlesungsdetails' }}
          />
          <Stack.Screen
            name="DualisStatistics"
            component={DualisStatistics}
            options={{ title: 'Dualis Modulstatistik' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="DualisLogin"
          screenOptions={stackHeaderConfig}
        >
          <Stack.Screen
            name="DualisLogin"
            component={DualisLogin}
            options={{ title: 'Dualis Login' }}
          />
          <Stack.Screen
            name="DualisMain"
            component={DualisMain}
            options={{ headerTitle: 'Dualis' }}
          />
          <Stack.Screen
            name="DualisDetail"
            component={DualisDetail}
            options={{ title: 'Dualis Vorlesungsdetails' }}
          />
          <Stack.Screen
            name="DualisStatistics"
            component={DualisStatistics}
            options={{ title: 'Dualis Modulstatistik' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    paddingLeft: 10,
    color: 'white',
  },
});
