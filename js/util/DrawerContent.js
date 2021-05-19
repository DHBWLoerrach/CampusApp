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
import AsyncStorage from '@react-native-community/async-storage';
import jwt_decode from 'jwt-decode';
import Colors from './Colors';

class DrawerContent extends React.Component {

  constructor(props){
      super(props)
  
      this.state = {
        darkThemeOn: false,
        authenticated: false,
        email: ""
      }

      this.toggleSwitch = this.toggleSwitch.bind(this);
      this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      this.isAuthenticated()
    }, 5000);
  }

  toggleSwitch() {
    this.setState({darkThemeOn: this.state.darkThemeOn ? false : true});
  }

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('dualisToken');
    let tokenDecoded;
    try {
      tokenDecoded = jwt_decode(token);
      if (Date.now() >= (tokenDecoded.standardclaims.exp * 1000)) {
        this.setState({authenticated: false});
        AsyncStorage.setItem('dualisToken', null);
        return;
      }
    } catch (err) {
      this.setState({authenticated: false});
      AsyncStorage.setItem('dualisToken', null);
      return;
    }
    this.setState({authenticated: true, email: tokenDecoded.standardclaims.sub});
    return;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
          <DrawerContentScrollView {...this.props.navigation}>
              <View style={styles.drawerContent}>
                  <View style={styles.userInfoSection}>
                    {this.state.authenticated &&
                      <View style={{flexDirection: "row", marginTop: 15}}>
                          <Avatar.Icon style={{backgroundColor: Colors.dhbwRed}} size={62} icon="face" color={"white"} />
                          <View style={{ flexDirection: "column", marginLeft: 5}}>
                            <Title style={styles.title}>Eingeloggt als:</Title>
                            <Caption style={styles.caption}>{this.state.email}</Caption>
                          </View>
                      </View>
                    }
                    {!this.state.authenticated &&
                      <View style={{flexDirection: "row", marginTop: 15}}>
                          <Avatar.Icon style={{backgroundColor: Colors.dhbwGray}} size={62} icon="face" color={"white"} />
                          <View style={{ flexDirection: "column", marginLeft: 5}}>
                            <Title style={styles.title}>Eingeloggt als:</Title>
                            <Caption style={styles.caption}>Gast</Caption>
                          </View>
                      </View>
                    }
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
                      onPress={() => {this.props.navigation.navigate("Home")}}
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
                      onPress={() => {this.props.navigation.navigate("Dualis")}}
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
                    {/*<DrawerItem
                      icon={({color, size}) => (
                          <Icon
                          name="dip-switch"
                          color={color}
                          size={size}
                          />
                      )}
                      label="Einstellungen"
                      onPress={() => {this.props.navigation.navigate("Screen")}}
                      />*/}
                  </Drawer.Section>
                  <Drawer.Section>
                    <TouchableRipple onPress={this.toggleSwitch}>
                      <View style={styles.darkMode}>
                        <Text>Dunkelmodus</Text>
                        <View pointerEvents="none">
                          <Switch trackColor={{true: Colors.dhbwRed, false: Colors.dhbwGray}} thumbColor="white" value={this.state.darkThemeOn} />
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


}

export default DrawerContent;

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
    }
});