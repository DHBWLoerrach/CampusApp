import React from 'react';
import { View, Text, Button, StatusBar, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import jwt_decode from 'jwt-decode';
import Colors from '../../util/Colors';
import DualisIntro from './DualisIntro';
import DualisLogin from './DualisLogin';
import DualisMain from './DualisMain';

const DualisNavigator = ({navigation}) => {

    const stackHeaderConfig = {
        headerBackTitle: 'Zurück',
        headerTintColor: 'white',
        headerLeft: () => <MaterialIcon
          style={{ paddingLeft: 10 }}
          onPress={() => {navigation.toggleDrawer()}}
          name="menu"
          size={30}
        />,
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

    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                initialRouteName="Home"
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default DualisNavigator;