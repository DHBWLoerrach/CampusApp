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

class DualisNavigator extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            dualisTokenPresent: false
        }

        this.dualisTokenPresent = this.dualisTokenPresent.bind(this);
    }

    componentDidMount() {
        this.dualisTokenPresent();
        setInterval(() => {
            this.dualisTokenPresent()
        }, 5000);
    }

    async dualisTokenPresent() {
        let token = await AsyncStorage.getItem('dualisToken');
        if (token != null) {
            this.setState({dualisTokenPresent: true});
        } else {
            this.setState({dualisTokenPresent: false});
        }
    }

    render() {

        const stackHeaderConfig = {
            headerBackTitle: 'Zurück',
            headerTintColor: 'white',
            headerLeft: () => <MaterialIcon
              style={{ paddingLeft: 10 }}
              onPress={() => {this.props.navigation.toggleDrawer()}}
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
                    {this.state.dualisTokenPresent ? (
                            <Stack.Screen
                                name="DualisMain"
                                component={DualisMain}
                                options={{ headerTitle: 'Dualis' }}
                            />
                        ) : (
                            <Stack.Screen
                                name="DualisIntro"
                                component={DualisIntro}
                                options={{ title: 'Campus App Dualis' }}
                            />
                        )
                    }
                    {!this.state.dualisTokenPresent ? (
                            <Stack.Screen
                                name="DualisMain"
                                component={DualisMain}
                                options={{ headerTitle: 'Dualis' }}
                            />
                        ) : (
                            <Stack.Screen
                                name="DualisIntro"
                                component={DualisIntro}
                                options={{ title: 'Campus App Dualis' }}
                            />
                        )
                    }
                    <Stack.Screen
                        name="DualisLogin"
                        component={DualisLogin}
                        options={{ title: 'Dualis Login' }}
                    />
    
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

}


export default DualisNavigator;