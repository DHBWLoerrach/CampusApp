import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import EnrollmentItem from './EnrollmentItem';
import {Picker} from '@react-native-picker/picker';


class DualisMain extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            loading: false,
            enrollments: [],
            noContent: false,
            error: null,
            selectedSemester: "Alle",
            selectableOptions: []
        }

        this.getPerformances = this.getPerformances.bind(this);
    }

    componentDidMount() {

        let year = new Date().getFullYear();

        for (let i = 0; i < 4; i++) {
            this.state.selectableOptions.push("WiSe " + (year - i));
            this.state.selectableOptions.push("SoSe " + (year - i));
        }

        this.getPerformances(null, null);
    }

    getSelectedSemester(value) {

        if (value != "Alle") {
            this.state.selectedSemester = value;
            var num = value.match(/\d/g);
            this.getPerformances(value.includes("WiSe"), num.join(""));
        } else {
            this.state.selectedSemester = "Alle";
            this.getPerformances(null, null);
        }
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

                if (response.status == 204) {
                    this.setState({noContent: true, error: null, enrollments: []});
                }
  
                response.json().then(json => {

                    if (response.status == 500) {
                        if (json.message != "Invalid token") {
                            this.setState({error: json.message, noContent: true, enrollments: []});
                        } else {
                            this.props.navigation.navigate("DualisLogin");
                        }
                    }

                    if(response.status == 200) {                  
                        this.setState({enrollments: json.enrollments, noContent: false, error: null});               
                    }
                });

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

        let enrollmentItems = [];

        this.state.enrollments.forEach(enrollment => {
            enrollmentItems.push(<EnrollmentItem key={enrollment.id} enrollment={enrollment} navigation={this.props.navigation} />);
        });

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <Picker
                        selectedValue={this.state.selectedSemester}
                        onValueChange={(itemValue, itemIndex) =>
                            this.getSelectedSemester(itemValue)
                        }>

                        {this.state.selectableOptions.map((opt, i) => (
                            <Picker.Item key={opt} label={opt} value={opt} />
                        ))}

                        <Picker.Item key="Alle" label="Alle" value="Alle" />
                    </Picker>

                    <>{enrollmentItems}</>

                    {this.state.error &&
                        <View style={styles.center}>
                            <Text style={styles.message}>{this.state.error}</Text>
                        </View>
                    }

                    {this.state.noContent &&
                        <View style={styles.center}>
                            <Text style={styles.message}>Kein Inhalt vorhanden</Text>
                        </View>
                    }
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
    message: {
        fontSize: 18,
        color: Colors.dhbwRed,
        textAlign: "center"
    },
    scrollView: {
        marginHorizontal: 20
    }
});