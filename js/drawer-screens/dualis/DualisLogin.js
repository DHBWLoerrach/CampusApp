import React from 'react';
import { View, Button, Image, StatusBar, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Caption, Paragraph, Drawer, Text, TextInput } from 'react-native-paper';
import Colors from '../../util/Colors';


const DualisLogin = ({navigation}) => {
    return (
        <View style={styles.container}>
            <TextInput style={{ marginTop: 40 }} theme={{ colors: { primary: Colors.dhbwRed }}} placeholder="DHBW E-Mail" />
            <TextInput style={{ marginTop: 40 }} theme={{ colors: { primary: Colors.dhbwRed }}} placeholder="Passwort" />
            <TouchableOpacity style={styles.dhbwButton} onPress={() => {}}>
                <Text style={{ color: "white", margin: 20 }}>Anmelden</Text>
            </TouchableOpacity>
            <Paragraph style={styles.paragraph}>Bitte denke daran, dass keine Gewähr für die Richtigkeit der hier bereitgestellten Informationen übernommen werden kann. Im Zweifelsfall ist das Sekretariat oder die entsprechende Lehrkraft zu befragen.</Paragraph>
            <Paragraph style={styles.paragraph}>Aus Sicherheitsgründen wirst Du nach 20 Minuten automatisch abgemeldet.</Paragraph>
        </View>
    );
};

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