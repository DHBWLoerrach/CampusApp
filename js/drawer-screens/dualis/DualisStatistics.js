import React from 'react';
import { View, Text, Button, StatusBar, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LectureItem from './LectureItem';


class DualisStatistics extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            loading: false,
            loginFailed: false,
            noContent: false,
            better: null,
            equal: null,
            worse: null,
            failureRate: null,
            error: null
        }

        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => this.load(this.props.route.params.id));
    }

    async load(enrollmentId) {
        this.setState({loading: true});

        const token = await AsyncStorage.getItem('dualisToken');

        try {
            fetch("http://134.255.237.241/student/module/statistics/?enrollmentId=" + enrollmentId, {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-key' : `${token}`
                }),
                mode: 'cors'
            }).then((response) => {

                if (response.status == 204) {
                    console.log("NOO Content");
                    this.setState({noContent: true, error: null});
                }

                if (response.status == 500) {
                    if (json.message != "Invalid token") {
                        this.setState({error: json.message, noContent: true});
                    } else {
                        this.props.navigation.navigate("DualisLogin");
                    }
                }

                if(response.status == 200) {
                    response.json().then(json => {                   
                        this.setState({better: json.better, equal: json.equal, worse: json.worse, failureRate: json.failureRate, noContent: false, error: null});
                    })
                }

                this.setState({loading: false});

            });
        } catch (ex) {
            this.setState({error: ex, loading: false});
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

        if (this.state.noContent) {
            return (
                <View style={styles.center}>
                    <Text style={styles.message}>Die Statistiken zu diesem Modul können nicht erfasst werden!</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Besser als du abgeschnitten haben</Text>
                <Text>{this.state.better.replace(/./g, ',')}%</Text>

                <Text style={styles.title}>Gleich gut wie Du abgeschnitten haben</Text>
                <Text>{this.state.equal.replace(/./g, ',')}%</Text>

                <Text style={styles.title}>Schlechter als Du abgeschnitten haben</Text>
                <Text>{this.state.worse.replace(/./g, ',')}%</Text>

                <Text style={styles.title}>der Studenten Deines Kurses.</Text>

                <Text style={styles.title}>Durchfallquote: {this.state.failureRate.replace(/./g, ',')}%</Text>
            </View>
        );
    }

}

export default DualisStatistics;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    message: {
        fontSize: 18,
        color: Colors.dhbwRed,
        textAlign: "center"
    },
    title: {
        fontSize: 14,
        color: Colors.dhbwGray,
        textAlign: "center"
    },
    scrollView: {
        marginHorizontal: 20
    }
});