import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { unregisterUserEvent } from '../helper';
import Form from '../../../util/Form';

function StuVEventsUnregister({ route }) {
    const navigation = useNavigation();
    const event = route.params.event;
    const [email, onChangeText] = React.useState(null);
    const [errText, setErrText] = React.useState(null);

    const fields = {
        "email": {
            name: "Email",
            value: "",
            required: true
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{padding:5,marginBottom:4}}>
            <Text style={{ fontWeight: "bold" }}>Abmeldung für das Event: {event.title}</Text>
            <Text>Geben Sie Ihre Email ein. Sie bekommen eine Bestätigung per Email.</Text>
            </View>
            <Form btnLabel="Abmeldung senden"
                btnFunc={(field) => unregisterUserEvent(field.email, event.event_id)
                    .then(r => navigation.goBack(null))
                    .catch(err => setErrText("Netzwerkfehler oder Email/Event existiert nicht oder ist nicht gültig"))}
                fields={fields}
            >
            </Form>
            <Text style={{ color: "red", marginBottom: "2%" }}>{errText}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    input: {
        height: "25%",
        marginBottom: "5%",
        marginTop: 10,
        color: "black",
        fontSize: 14,
        borderWidth: 1,
    },
    container: {
        flex: 1,
        alignItems: "center"
    },
    sub_container: {
        width: "70%"
    }
});

export default StuVEventsUnregister;