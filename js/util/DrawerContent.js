import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Colors from './Colors';

export function DrawerContent(props) {

    const [darkThemeSet, setDarkTheme] = React.useState(false);
    const toggleSwitch = () => {
      setDarkTheme(!darkThemeSet);
    }

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{flexDirection: "row", marginTop: 15}}>
                            <Avatar.Icon style={{backgroundColor: Colors.dhbwRed}} size={62} icon="face" color={"white"} />
                            <View style={{ flexDirection: "column", marginLeft: 5}}>
                              <Title style={styles.title}>Eingeloggt als:</Title>
                              <Caption style={styles.caption}>kaiseand@dhbw-loerrach.de</Caption>
                            </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                      <DrawerItem
                        icon={({color, size}) => (
                            <Icon
                            name="home-outline"
                            color={color}
                            size={size}
                            />
                        )}
                        label="Startseite"
                        onPress={() => {}}
                      />
                      <DrawerItem
                        icon={({color, size}) => (
                            <Icon
                            name="chart-areaspline"
                            color={color}
                            size={size}
                            />
                        )}
                        label="Dualis"
                        onPress={() => {props.navigation.navigate("DualisLogin")}}
                      />
                      <DrawerItem
                        icon={({color, size}) => (
                            <Icon
                            name="google-classroom"
                            color={color}
                            size={size}
                            />
                        )}
                        label="Raumreservierung"
                        onPress={() => {}}
                      />
                      <DrawerItem
                        icon={({color, size}) => (
                            <Icon
                            name="dip-switch"
                            color={color}
                            size={size}
                            />
                        )}
                        label="Einstellungen"
                        onPress={() => {props.navigation.navigate('TabNavigator', { screen: 'Services' })}}
                      />
                    </Drawer.Section>
                    <Drawer.Section>
                      <TouchableRipple onPress={() => {toggleSwitch()}}>
                        <View style={styles.darkMode}>                       
                          <Text>Dunkelmodus</Text>
                          <View pointerEvents="none">
                            <Switch trackColor={{true: Colors.dhbwRed, false: Colors.dhbwGray}} thumbColor="white" value={darkThemeSet} />
                          </View>
                        </View>
                      </TouchableRipple>
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({color, size}) => (
                        <Icon
                        name="exit-run"
                        color={color}
                        size={size}
                        />
                    )}
                    label="Abmelden"
                    onPress={() => {}}
                />
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
      borderTopWidth: 1
    },
    darkMode: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
});