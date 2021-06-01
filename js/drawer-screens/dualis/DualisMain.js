import React from 'react';
import { View, Text, Button, StatusBar, Platform, ScrollView, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import Colors from '../../util/Colors';
import EnrollmentItem from './EnrollmentItem';
import jwt_decode from 'jwt-decode';


class DualisMain extends React.Component {
    constructor(props){
        super(props)

        this.state = {
          loading: false,
          loginFailed: false,
          enrollments: [],
          noContent: false,
          error: null,
          open: false,
          value: null,
          items: [
            {label: 'Apple', value: 'apple'},
            {label: 'Banana', value: 'banana'}
          ]
        }

        this.load = this.load.bind(this);
        this.getPerformances = this.getPerformances.bind(this);
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => this.load())
    }

    componentWillUnmount() {
        this.focusListener.remove();
    }

    load() {
        if (this.isAuthenticated()) {
            console.log("Authenticated!!!!!!!!!!!!");
            this.getPerformances(null, null);
        } else {
            console.log("Not authhh!!!");
            this.props.navigation.navigate("DualisLogin");
        }
    }

    async isAuthenticated() {
        const token = await AsyncStorage.getItem('dualisToken');
    
        if (token == null) {
            console.log("Token null");
            return false;
        }
    
        let tokenDecoded;
        try {
            tokenDecoded = jwt_decode(token);
            console.log(Date.now());
            console.log(tokenDecoded.standardclaims.exp * 1000)
            if (Date.now() >= (tokenDecoded.standardclaims.exp * 1000)) {
                console.log("Abgelaufen");
                return false;
            }
        } catch (err) {
            console.log("Error " + err);
            return false;
        }

        console.log("Return true");
        
        return true;
      }

    setOpen(open) {
        this.setState({
            open
        });
    }
    
    setValue(callback) {
        this.setState(state => ({
            value: callback(state.value)
        }));
    }

    setItems(callback) {
        this.setState(state => ({
            items: callback(state.items)
        }));
    }
    
    async getPerformances(isWintersemester, year) {
        this.setState({loading: true});

        const token = await AsyncStorage.getItem('dualisToken');
        let url = "http://134.255.237.241/student/performance/?";

        if(isWintersemester != null) {
            url += "&isWintersemester=" + isWintersemester;
        }

        if(year != null) {
            url += "&year=" + year;
        }

        try {
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-key' : `${token}`
                }),
                mode: 'cors'
            }).then((response) => {

                response.json().then(json => {
                    if (response.status == 500) {
                        if (json.message != "Invalid token") {
                            this.setState({error: json.message, noContent: true, enrollments: []});
                        } else {
                            AsyncStorage.setItem('dualisToken', null);
                            this.props.navigation.navigate("DualisLogin");
                        }
                    }
    
                    if (response.status == 204) {
                        this.setState({noContent: true, error: null, enrollments: []});
                    }
    
                    if(response.status == 200 && json.enrollments != "" && json.enrollments != null) {
                        this.setState({enrollments: json.enrollments, noContent: false, error: null});
                    }
    
                    this.setState({loading: false});
                })
            });
        } catch (ex) {
            this.setState({error: ex});
            this.setState({loading: false});
        }
    }

    render() {

        if (this.state.loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>   
            );
        }

        let enrollmentItems = [];

        this.state.enrollments.forEach(enrollment => {
            enrollmentItems.push(<EnrollmentItem key={enrollment.id} enrollment={enrollment} navigation={this.props.navigation} />);
        });

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <DropDownPicker
                        style={{ marginTop: 5 }}
                        open={this.state.open}
                        value={this.state.value}
                        items={this.state.items}
                        setOpen={this.setOpen}
                        setValue={this.setValue}
                        setItems={this.setItems}
                    />

                    <>{enrollmentItems}</>
                    <Text>{this.state.error}</Text>
                    <Text>{this.state.noContent}</Text>
                </ScrollView>
            </View>
        );
    }
}

export default DualisMain;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    scrollView: {
        marginHorizontal: 20
    }
});