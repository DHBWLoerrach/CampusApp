import React from 'react';
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

class DualisNavigator extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            authenticated: false,
            intro: false,
            loading: false
        }

        this.isAuthenticated = this.isAuthenticated.bind(this);
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => this.isAuthenticated());
    }

    async isAuthenticated() {
        this.setState({loading: true});
        const token = await AsyncStorage.getItem('dualisToken');
    
        if (token == null) {
          this.setState({authenticated: false, intro: true, loading: false});
          return;
        }
    
        let tokenDecoded;
        try {
          tokenDecoded = jwt_decode(token);
          if (Date.now() >= (tokenDecoded.standardclaims.exp * 1000)) {
            this.setState({authenticated: false, intro: false, loading: false});
            return;
          }
        } catch (err) {
          this.setState({authenticated: false, intro: false, loading: false});
          return;
        }
        this.setState({authenticated: true, intro: false, loading: false});
        return;
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

        if (this.state.loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>
            );
        }

        return (
            <NavigationContainer independent={true}>
                {this.state.authenticated ? (
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
                ) : (
                    this.state.intro ? (
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
                    )

                )}
            </NavigationContainer>
        );
    }

}


export default DualisNavigator;

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});