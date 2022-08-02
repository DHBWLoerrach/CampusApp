import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Title, Caption, Drawer } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import jwt_decode from 'jwt-decode';
import Colors from '../Styles/Colors';
import Styles from '../Styles/StyleSheet';

export default function DrawerContent({ navigation }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => setInterval(() => isAuthenticated(), 5000), []);

  async function isAuthenticated() {
    const token = await AsyncStorage.getItem('dualisToken');

    if (token == null || token === 'logout') {
      setAuthenticated(false);
      return;
    }

    let tokenDecoded;
    try {
      tokenDecoded = jwt_decode(token);
      if (Date.now() >= tokenDecoded.standardclaims.exp * 1000) {
        setAuthenticated(false);
        return;
      }
    } catch (err) {
      setAuthenticated(false);
      return;
    }
    setAuthenticated(true);
    setEmail(tokenDecoded.standardclaims.sub);
  }

  function logout() {
    AsyncStorage.setItem('dualisToken', 'logout');
    navigation.navigate('Home');
  }

  return (
    <View style={Styles.DrawerContent.drawerContent}>
      <DrawerContentScrollView {...navigation}>
        <View style={Styles.DrawerContent.drawerContent}>
          <View style={Styles.DrawerContent.userInfoSection}>
            {authenticated && (
              <View style={Styles.DrawerContent.avatar}>
                <Avatar.Icon
                  style={{ backgroundColor: Colors.dhbwRed }}
                  size={62}
                  icon="face"
                  color={'white'}
                />
                <View style={Styles.DrawerContent.loggedIn}>
                  <Title style={Styles.DrawerContent.title}>Eingeloggt als:</Title>
                  <Caption style={Styles.DrawerContent.caption}>{email}</Caption>
                </View>
              </View>
            )}
            {!authenticated && (
              <View style={Styles.DrawerContent.avatar}>
                <Avatar.Icon
                  style={{ backgroundColor: Colors.dhbwGray }}
                  size={62}
                  icon="face"
                  color={'white'}
                />
                <View style={Styles.DrawerContent.loggedIn}>
                  <Title style={Styles.DrawerContent.title}>Eingeloggt als:</Title>
                  <Caption style={Styles.DrawerContent.caption}>Gast</Caption>
                </View>
              </View>
            )}
          </View>
          <Drawer.Section style={Styles.DrawerContent.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Startseite"
              onPress={() => navigation.navigate('Home')}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon
                  name="chart-areaspline"
                  color={color}
                  size={size}
                />
              )}
              label="Dualis"
              onPress={() => navigation.navigate('Dualis')}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={Styles.DrawerContent.bottomDrawerSection}>
        {authenticated && (
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="exit-run" color={color} size={size} />
            )}
            label="Abmelden"
            onPress={() => logout()}
          />
        )}
      </Drawer.Section>
    </View>
  );
}
