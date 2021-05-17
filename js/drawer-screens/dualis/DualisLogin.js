import React from 'react';
import { View, Button, Image, StatusBar, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Caption, Paragraph, Drawer, Text, TextInput } from 'react-native-paper';
import Colors from '../../util/Colors';

class DualisLogin extends React.Component {
    constructor(props){
        super(props)
    
        this.state = {
          email: "",
          password: "",
          response: "Default response"
        }

        this.login = this.login.bind(this);
    }

    login() {
        //this.setState({response: "Hello"});
        try{
        fetch('http://134.255.237.241/login/', {
            method: 'POST',
            header: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }),
            mode: 'cors',
            body: JSON.stringify({
                login: {
                    email: this.state.email,
                    password: this.state.password
                },
            })
        }).then((resp) => resp.json()).then((respJson) => {
            this.setState({response: JSON.stringify(respJson)});
        });
    } catch (ex) {
        this.setState({response: ex});
    }
    }

    render() {

        return (
            <View style={styles.container}>
                <TextInput style={{ marginTop: 40 }} theme={{ colors: { primary: Colors.dhbwRed }}} onChangeText={value=>{this.setState({email:value})}} placeholder="DHBW E-Mail" />
                <TextInput style={{ marginTop: 40 }} theme={{ colors: { primary: Colors.dhbwRed }}} onChangeText={value=>{this.setState({password:value})}} placeholder="Passwort" />
                <TouchableOpacity style={styles.dhbwButton} onPress={this.login}>
                    <Text style={{ color: "white", margin: 20 }}>Anmelden</Text>
                </TouchableOpacity>
                <Text>{this.state.email}</Text>
                <Text>{this.state.password}</Text>
                <Text>{this.state.response}</Text>
                <Paragraph style={styles.paragraph}>Bitte denke daran, dass keine Gewähr für die Richtigkeit der hier bereitgestellten Informationen übernommen werden kann. Im Zweifelsfall ist das Sekretariat oder die entsprechende Lehrkraft zu befragen.</Paragraph>
                <Paragraph style={styles.paragraph}>Aus Sicherheitsgründen wirst Du nach 20 Minuten automatisch abgemeldet.</Paragraph>
            </View>
        );
    }
}


export default DualisLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 14,
        paddingLeft: "10%",
        paddingRight: "10%",
        textAlign: "center",
        marginTop: 40
    },
    dhbwButton: {
        width: "100%",
        backgroundColor: Colors.dhbwRed,
        alignItems: "center",
        marginTop: 20
    }
});