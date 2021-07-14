import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Title, Caption, Drawer } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import jwt_decode from 'jwt-decode';
import Colors from './Colors';

export default function DrawerContent({ navigation }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => setInterval(() => isAuthenticated(), 5000), []);

  async function isAuthenticated() {
    const token = await AsyncStorage.getItem('dualisToken');

    if (token == null || token == 'logout') {
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
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...navigation}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            {authenticated && (
              <View style={styles.avatar}>
                <Avatar.Icon
                  style={{ backgroundColor: Colors.dhbwRed }}
                  size={62}
                  icon="face"
                  color={'white'}
                />
                <View style={styles.loggedIn}>
                  <Title style={styles.title}>Eingeloggt als:</Title>
                  <Caption style={styles.caption}>{email}</Caption>
                </View>
              </View>
            )}
            {!authenticated && (
              <View style={styles.avatar}>
                <Avatar.Icon
                  style={{ backgroundColor: Colors.dhbwGray }}
                  size={62}
                  icon="face"
                  color={'white'}
                />
                <View style={styles.loggedIn}>
                  <Title style={styles.title}>Eingeloggt als:</Title>
                  <Caption style={styles.caption}>Gast</Caption>
                </View>
              </View>
            )}
          </View>
          <Drawer.Section style={styles.drawerSection}>
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
      <Drawer.Section style={styles.bottomDrawerSection}>
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

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  avatar: {
    flexDirection: 'row',
    marginTop: 15,
  },
  loggedIn: {
    flexDirection: 'column',
    marginLeft: 5,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
});
