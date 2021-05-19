import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import Colors from '../../util/Colors';


class DualisMain extends React.Component {
    constructor(props){
        super(props)

        this.state = {
          loading: false,
          loginFailed: false,
          enrollments: null,
          noContent: false,
          error: null,
          open: false,
          value: null,
          items: [
            {label: 'Apple', value: 'apple'},
            {label: 'Banana', value: 'banana'}
          ]
        }

        this.getPerformances = this.getPerformances.bind(this);
    }

    componentDidMount() {
        this.getPerformances(null, null);
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
            url = url + "&isWintersemester=" + isWintersemester;
        }

        if(year != null) {
            url = url + "&year=" + year;
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
                            this.setState({error: json.message});
                        } else {
                            AsyncStorage.setItem('dualisToken', null);
                            this.props.navigation.navigate("DualisLogin");
                        }
                    }
    
                    if (response.status == 204) {
                        this.setState({noContent: true});
                    }
    
                    if(response.status == 200 && json.enrollments != "" && json.enrollments != null) {
                        this.setState({enrollments: JSON.stringify(json.enrollments)});
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
                <ActivityIndicator />
            );
        }

        return (
            <View style={styles.container}>
                <DropDownPicker
                    open={this.state.open}
                    value={this.state.value}
                    items={this.state.items}
                    setOpen={this.setOpen}
                    setValue={this.setValue}
                    setItems={this.setItems}
                />

                <Text>{this.state.enrollments}</Text>
                <Text>{this.state.error}</Text>
                <Text>{this.state.noContent}</Text>
            </View>
        );
    }
}

export default DualisMain;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});