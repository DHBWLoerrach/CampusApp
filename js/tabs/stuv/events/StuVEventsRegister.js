import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import {
    inviteUserEvent,
    loadEvents,
    unixTimeToDateText,
    unixTimeToTimeText,
} from '../helper';
import Form from '../../../util/Form';
import ReloadView from '../../../util/ReloadView';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { id } from 'date-fns/locale';

function StuVEventsRegister({ route }) {
    const navigation = useNavigation();
    const event = route.params.event;
    const [errText, setErrText] = React.useState(null);


    const fields =
    {
        "Email": {
            name: "Email",
            required: true,
            value: ""
        },
        "Vorname": {
            name: "Vorname",
            required: true,
            value: ""
        },
        "Nachname": {
            name: "Nachname",
            required: true,
            value: ""
        }
    }


    return (
        <View style={styles.container}>
            <View style={{ marginBottom: 10, marginTop: 4 }}>
                <Text style={styles.text}>Anmeldung für das Event: {" " + event.title} </Text>
                <Text style={styles.text}>Bitte geben Sie die folgenden Daten ein.</Text>
            </View>
            <Form btnLabel="Einladung senden" btnFunc={
                (fields) =>
                    inviteUserEvent(fields["Email"].value, fields["Vorname"].value, fields["Nachname"].value, event)
                        .then(r => navigation.goBack(null))
                        .catch(err => setErrText("Netzwerkfehler oder Email/Event existiert nicht oder ist nicht gültig"))
            }
                fields={fields}></Form>
            <Text style={{ color: "red", padding: 10, marginBottom: 8, fontSize: 16 }}>{errText}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    text: {
        fontWeight: "bold",
        fontSize: 15
    },
    container: {
        flex: 1,
    }
});

export default StuVEventsRegister;